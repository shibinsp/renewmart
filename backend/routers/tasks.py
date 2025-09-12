from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.tasks import Task, TaskHistory
from models.users import User, UserRole
from models.lands import Land
from routers.auth import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Pydantic models
class TaskCreate(BaseModel):
    land_id: str
    task_type: str
    description: str
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = "medium"

class TaskUpdate(BaseModel):
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    completion_notes: Optional[str] = None

class TaskResponse(BaseModel):
    task_id: str
    land_id: str
    task_type: str
    description: str
    assigned_to: Optional[str]
    assigned_by: str
    status: str
    priority: str
    due_date: Optional[datetime]
    completion_notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class TaskHistoryResponse(BaseModel):
    history_id: str
    task_id: str
    changed_by: str
    old_status: Optional[str]
    new_status: str
    notes: Optional[str]
    changed_at: datetime
    
    class Config:
        from_attributes = True

# Helper functions
def check_user_role(db: Session, user_id: str, required_roles: List[str]) -> bool:
    user_roles = db.query(UserRole).filter(UserRole.user_id == user_id).all()
    roles = [ur.role_key for ur in user_roles]
    return any(role in roles for role in required_roles)

def is_admin(db: Session, user_id: str) -> bool:
    return check_user_role(db, user_id, ["administrator"])

def is_landowner(db: Session, user_id: str, land_id: str) -> bool:
    land = db.query(Land).filter(Land.land_id == land_id).first()
    return land and str(land.landowner_id) == str(user_id)

def can_manage_task(db: Session, user_id: str, task: Task) -> bool:
    # Admin can manage all tasks
    if is_admin(db, user_id):
        return True
    
    # Task creator can manage
    if str(task.assigned_by) == str(user_id):
        return True
    
    # Landowner can manage tasks for their land
    if is_landowner(db, user_id, str(task.land_id)):
        return True
    
    return False

def can_update_task(db: Session, user_id: str, task: Task) -> bool:
    # Admin can update all tasks
    if is_admin(db, user_id):
        return True
    
    # Task creator can update
    if str(task.assigned_by) == str(user_id):
        return True
    
    # Assigned user can update their tasks
    if task.assigned_to and str(task.assigned_to) == str(user_id):
        return True
    
    # Landowner can update tasks for their land
    if is_landowner(db, user_id, str(task.land_id)):
        return True
    
    return False

# API endpoints
@router.post("/", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new task"""
    # Check if land exists
    land = db.query(Land).filter(Land.land_id == task_data.land_id).first()
    if not land:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Land not found"
        )
    
    # Check permissions - only admin or landowner can create tasks
    if not (is_admin(db, str(current_user.user_id)) or 
            is_landowner(db, str(current_user.user_id), task_data.land_id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to create tasks for this land"
        )
    
    # Validate assigned user if provided
    if task_data.assigned_to:
        assigned_user = db.query(User).filter(User.user_id == task_data.assigned_to).first()
        if not assigned_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assigned user not found"
            )
    
    # Create task
    task = Task(
        land_id=task_data.land_id,
        task_type=task_data.task_type,
        description=task_data.description,
        assigned_to=task_data.assigned_to,
        assigned_by=current_user.user_id,
        status="pending",
        priority=task_data.priority,
        due_date=task_data.due_date
    )
    
    db.add(task)
    db.commit()
    db.refresh(task)
    
    # Create task history entry
    history = TaskHistory(
        task_id=task.task_id,
        changed_by=current_user.user_id,
        old_status=None,
        new_status="pending",
        notes="Task created"
    )
    db.add(history)
    db.commit()
    
    return TaskResponse(
        task_id=str(task.task_id),
        land_id=str(task.land_id),
        task_type=task.task_type,
        description=task.description,
        assigned_to=str(task.assigned_to) if task.assigned_to else None,
        assigned_by=str(task.assigned_by),
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
        completion_notes=task.completion_notes,
        created_at=task.created_at,
        updated_at=task.updated_at
    )

@router.get("/", response_model=List[TaskResponse])
async def get_tasks(
    land_id: Optional[str] = None,
    assigned_to: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get tasks with optional filters"""
    query = db.query(Task)
    
    # Apply filters
    if land_id:
        # Check permissions for specific land
        land = db.query(Land).filter(Land.land_id == land_id).first()
        if not land:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Land not found"
            )
        
        if not (is_admin(db, str(current_user.user_id)) or 
                is_landowner(db, str(current_user.user_id), land_id)):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to view tasks for this land"
            )
        
        query = query.filter(Task.land_id == land_id)
    else:
        # If no land_id specified, only show tasks user can access
        if not is_admin(db, str(current_user.user_id)):
            # Get user's lands
            user_lands = db.query(Land).filter(Land.landowner_id == current_user.user_id).all()
            land_ids = [str(land.land_id) for land in user_lands]
            
            # Also include tasks assigned to user
            query = query.filter(
                (Task.land_id.in_(land_ids)) |
                (Task.assigned_to == current_user.user_id) |
                (Task.assigned_by == current_user.user_id)
            )
    
    if assigned_to:
        query = query.filter(Task.assigned_to == assigned_to)
    
    if status:
        query = query.filter(Task.status == status)
    
    tasks = query.order_by(Task.created_at.desc()).all()
    
    result = []
    for task in tasks:
        result.append(TaskResponse(
            task_id=str(task.task_id),
            land_id=str(task.land_id),
            task_type=task.task_type,
            description=task.description,
            assigned_to=str(task.assigned_to) if task.assigned_to else None,
            assigned_by=str(task.assigned_by),
            status=task.status,
            priority=task.priority,
            due_date=task.due_date,
            completion_notes=task.completion_notes,
            created_at=task.created_at,
            updated_at=task.updated_at
        ))
    
    return result

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get task by ID"""
    task = db.query(Task).filter(Task.task_id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check permissions
    if not (is_admin(db, str(current_user.user_id)) or 
            str(task.assigned_to) == str(current_user.user_id) or
            str(task.assigned_by) == str(current_user.user_id) or
            is_landowner(db, str(current_user.user_id), str(task.land_id))):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view this task"
        )
    
    return TaskResponse(
        task_id=str(task.task_id),
        land_id=str(task.land_id),
        task_type=task.task_type,
        description=task.description,
        assigned_to=str(task.assigned_to) if task.assigned_to else None,
        assigned_by=str(task.assigned_by),
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
        completion_notes=task.completion_notes,
        created_at=task.created_at,
        updated_at=task.updated_at
    )

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update task"""
    task = db.query(Task).filter(Task.task_id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check permissions
    if not can_update_task(db, str(current_user.user_id), task):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this task"
        )
    
    # Store old status for history
    old_status = task.status
    
    # Update task fields
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == 'assigned_to' and value:
            # Validate user exists
            user = db.query(User).filter(User.user_id == value).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Assigned user not found"
                )
        setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    
    # Create history entry if status changed
    if 'status' in update_data and old_status != task.status:
        history = TaskHistory(
            task_id=task.task_id,
            changed_by=current_user.user_id,
            old_status=old_status,
            new_status=task.status,
            notes=f"Status changed from {old_status} to {task.status}"
        )
        db.add(history)
        db.commit()
    
    return TaskResponse(
        task_id=str(task.task_id),
        land_id=str(task.land_id),
        task_type=task.task_type,
        description=task.description,
        assigned_to=str(task.assigned_to) if task.assigned_to else None,
        assigned_by=str(task.assigned_by),
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
        completion_notes=task.completion_notes,
        created_at=task.created_at,
        updated_at=task.updated_at
    )

@router.delete("/{task_id}", response_model=dict)
async def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete task (admin or task creator only)"""
    task = db.query(Task).filter(Task.task_id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check permissions
    if not can_manage_task(db, str(current_user.user_id), task):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this task"
        )
    
    # Delete task history first (foreign key constraint)
    db.query(TaskHistory).filter(TaskHistory.task_id == task_id).delete()
    
    # Delete task
    db.delete(task)
    db.commit()
    
    return {"message": "Task deleted successfully"}

@router.get("/{task_id}/history", response_model=List[TaskHistoryResponse])
async def get_task_history(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get task history"""
    task = db.query(Task).filter(Task.task_id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check permissions
    if not (is_admin(db, str(current_user.user_id)) or 
            str(task.assigned_to) == str(current_user.user_id) or
            str(task.assigned_by) == str(current_user.user_id) or
            is_landowner(db, str(current_user.user_id), str(task.land_id))):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view task history"
        )
    
    history = db.query(TaskHistory).filter(
        TaskHistory.task_id == task_id
    ).order_by(TaskHistory.changed_at.desc()).all()
    
    result = []
    for h in history:
        result.append(TaskHistoryResponse(
            history_id=str(h.history_id),
            task_id=str(h.task_id),
            changed_by=str(h.changed_by),
            old_status=h.old_status,
            new_status=h.new_status,
            notes=h.notes,
            changed_at=h.changed_at
        ))
    
    return result

@router.get("/assigned/me", response_model=List[TaskResponse])
async def get_my_tasks(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get tasks assigned to current user"""
    query = db.query(Task).filter(Task.assigned_to == current_user.user_id)
    
    if status:
        query = query.filter(Task.status == status)
    
    tasks = query.order_by(Task.due_date.asc().nullslast(), Task.created_at.desc()).all()
    
    result = []
    for task in tasks:
        result.append(TaskResponse(
            task_id=str(task.task_id),
            land_id=str(task.land_id),
            task_type=task.task_type,
            description=task.description,
            assigned_to=str(task.assigned_to) if task.assigned_to else None,
            assigned_by=str(task.assigned_by),
            status=task.status,
            priority=task.priority,
            due_date=task.due_date,
            completion_notes=task.completion_notes,
            created_at=task.created_at,
            updated_at=task.updated_at
        ))
    
    return result