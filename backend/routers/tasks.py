from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from uuid import UUID
from datetime import datetime
import uuid

from database import get_db
from auth import get_current_user, require_admin
from models.schemas import (
    TaskCreate, TaskUpdate, TaskResponse, TaskHistoryResponse,
    MessageResponse
)

router = APIRouter(prefix="/tasks", tags=["tasks"])

# Helper functions
def can_access_task(user_roles: List[str], user_id: str, task_data: dict) -> bool:
    """Check if user can access a task"""
    # Admin can access all tasks
    if "administrator" in user_roles:
        return True
    
    # Task creator can access
    if str(task_data.get("assigned_by")) == user_id:
        return True
    
    # Assigned user can access their tasks
    if task_data.get("assigned_to") and str(task_data.get("assigned_to")) == user_id:
        return True
    
    # Land owner can access tasks for their land
    if str(task_data.get("owner_id")) == user_id:
        return True
    
    return False

def can_manage_task(user_roles: List[str], user_id: str, task_data: dict) -> bool:
    """Check if user can manage (create/update/delete) a task"""
    # Admin can manage all tasks
    if "administrator" in user_roles:
        return True
    
    # Task creator can manage
    if str(task_data.get("assigned_by")) == user_id:
        return True
    
    # Land owner can manage tasks for their land
    if str(task_data.get("owner_id")) == user_id:
        return True
    
    return False

# Task endpoints
@router.post("/", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new task (admin or land owner only)."""
    # Check if land exists and user has permission
    land_check = text("""
        SELECT owner_id, status_key FROM lands WHERE land_id = :land_id
    """)
    
    land_result = db.execute(land_check, {"land_id": str(task_data.land_id)}).fetchone()
    
    if not land_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Land not found"
        )
    
    user_roles = current_user.get("roles", [])
    if ("administrator" not in user_roles and 
        str(land_result.owner_id) != current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to create tasks for this land"
        )
    
    # Validate assigned_to user if provided
    if task_data.assigned_to:
        user_check = text("SELECT user_id FROM users WHERE user_id = :user_id")
        user_result = db.execute(user_check, {"user_id": str(task_data.assigned_to)}).fetchone()
        
        if not user_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assigned user not found"
            )
    
    try:
        # Use stored procedure to create task
        task_id = str(uuid.uuid4())
        
        # Call sp_task_create stored procedure
        create_proc = text("""
            CALL sp_task_create(
                :task_id, :land_id, :task_type, :description,
                :assigned_to, :assigned_by, :due_date, :priority
            )
        """)
        
        db.execute(create_proc, {
            "task_id": task_id,
            "land_id": str(task_data.land_id),
            "task_type": task_data.task_type,
            "description": task_data.description,
            "assigned_to": str(task_data.assigned_to) if task_data.assigned_to else None,
            "assigned_by": current_user["user_id"],
            "due_date": task_data.due_date,
            "priority": task_data.priority or "medium"
        })
        
        db.commit()
        
        # Fetch the created task
        return await get_task(UUID(task_id), current_user, db)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create task: {str(e)}"
        )

@router.get("/", response_model=List[TaskResponse])
async def get_tasks(
    land_id: Optional[UUID] = None,
    assigned_to: Optional[UUID] = None,
    status: Optional[str] = None,
    task_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get tasks with optional filters."""
    user_roles = current_user.get("roles", [])
    
    # Build base query
    base_query = """
        SELECT t.task_id, t.land_id, t.task_type, t.description,
               t.assigned_to, t.assigned_by, t.status, t.priority,
               t.due_date, t.completion_notes, t.created_at, t.updated_at,
               l.title as land_title, l.owner_id,
               u1.first_name || ' ' || u1.last_name as assigned_to_name,
               u2.first_name || ' ' || u2.last_name as assigned_by_name
        FROM tasks t
        JOIN lands l ON t.land_id = l.land_id
        LEFT JOIN users u1 ON t.assigned_to = u1.user_id
        LEFT JOIN users u2 ON t.assigned_by = u2.user_id
        WHERE 1=1
    """
    
    params = {"skip": skip, "limit": limit}
    
    # Add filters
    if land_id:
        base_query += " AND t.land_id = :land_id"
        params["land_id"] = str(land_id)
    
    if assigned_to:
        base_query += " AND t.assigned_to = :assigned_to"
        params["assigned_to"] = str(assigned_to)
    
    if status:
        base_query += " AND t.status = :status"
        params["status"] = status
    
    if task_type:
        base_query += " AND t.task_type = :task_type"
        params["task_type"] = task_type
    
    # Add permission filter for non-admin users
    if "administrator" not in user_roles:
        base_query += """
            AND (t.assigned_to = :user_id 
                 OR t.assigned_by = :user_id 
                 OR l.owner_id = :user_id)
        """
        params["user_id"] = current_user["user_id"]
    
    base_query += " ORDER BY t.created_at DESC OFFSET :skip LIMIT :limit"
    
    results = db.execute(text(base_query), params).fetchall()
    
    return [
        TaskResponse(
            task_id=row.task_id,
            land_id=row.land_id,
            task_type=row.task_type,
            description=row.description,
            assigned_to=row.assigned_to,
            assigned_by=row.assigned_by,
            status=row.status,
            priority=row.priority,
            due_date=row.due_date,
            completion_notes=row.completion_notes,
            created_at=row.created_at,
            updated_at=row.updated_at,
            land_title=row.land_title,
            assigned_to_name=row.assigned_to_name,
            assigned_by_name=row.assigned_by_name
        )
        for row in results
    ]

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get task by ID."""
    query = text("""
        SELECT t.task_id, t.land_id, t.task_type, t.description,
               t.assigned_to, t.assigned_by, t.status, t.priority,
               t.due_date, t.completion_notes, t.created_at, t.updated_at,
               l.title as land_title, l.owner_id,
               u1.first_name || ' ' || u1.last_name as assigned_to_name,
               u2.first_name || ' ' || u2.last_name as assigned_by_name
        FROM tasks t
        JOIN lands l ON t.land_id = l.land_id
        LEFT JOIN users u1 ON t.assigned_to = u1.user_id
        LEFT JOIN users u2 ON t.assigned_by = u2.user_id
        WHERE t.task_id = :task_id
    """)
    
    result = db.execute(query, {"task_id": str(task_id)}).fetchone()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check permissions
    user_roles = current_user.get("roles", [])
    task_data = {
        "assigned_by": result.assigned_by,
        "assigned_to": result.assigned_to,
        "owner_id": result.owner_id
    }
    
    if not can_access_task(user_roles, current_user["user_id"], task_data):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view this task"
        )
    
    return TaskResponse(
        task_id=result.task_id,
        land_id=result.land_id,
        task_type=result.task_type,
        description=result.description,
        assigned_to=result.assigned_to,
        assigned_by=result.assigned_by,
        status=result.status,
        priority=result.priority,
        due_date=result.due_date,
        completion_notes=result.completion_notes,
        created_at=result.created_at,
        updated_at=result.updated_at,
        land_title=result.land_title,
        assigned_to_name=result.assigned_to_name,
        assigned_by_name=result.assigned_by_name
    )

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID,
    task_update: TaskUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update task (assigned user, creator, or admin only)."""
    # Check if task exists and user has permission
    task_check = text("""
        SELECT t.assigned_to, t.assigned_by, t.status as current_status, l.owner_id
        FROM tasks t
        JOIN lands l ON t.land_id = l.land_id
        WHERE t.task_id = :task_id
    """)
    
    task_result = db.execute(task_check, {"task_id": str(task_id)}).fetchone()
    
    if not task_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    user_roles = current_user.get("roles", [])
    task_data = {
        "assigned_by": task_result.assigned_by,
        "assigned_to": task_result.assigned_to,
        "owner_id": task_result.owner_id
    }
    
    # Check if user can update task (assigned user can only update status and completion_notes)
    can_full_update = can_manage_task(user_roles, current_user["user_id"], task_data)
    can_status_update = (str(task_result.assigned_to) == current_user["user_id"] if task_result.assigned_to else False)
    
    if not (can_full_update or can_status_update):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this task"
        )
    
    # Validate assigned_to user if provided
    if task_update.assigned_to:
        user_check = text("SELECT user_id FROM users WHERE user_id = :user_id")
        user_result = db.execute(user_check, {"user_id": str(task_update.assigned_to)}).fetchone()
        
        if not user_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assigned user not found"
            )
    
    try:
        # If status is being updated, use stored procedure
        if task_update.status and task_update.status != task_result.current_status:
            # Use sp_task_update_status stored procedure
            status_proc = text("""
                CALL sp_task_update_status(
                    :task_id, :new_status, :changed_by, :notes
                )
            """)
            
            db.execute(status_proc, {
                "task_id": str(task_id),
                "new_status": task_update.status,
                "changed_by": current_user["user_id"],
                "notes": task_update.completion_notes or "Status updated"
            })
        
        # Build dynamic update query for other fields
        update_fields = []
        params = {"task_id": str(task_id)}
        
        update_data = task_update.dict(exclude_unset=True, exclude={"status"})
        
        for field, value in update_data.items():
            if can_full_update or (field in ["completion_notes"] and can_status_update):
                if field == "assigned_to" and value:
                    update_fields.append(f"{field} = :{field}")
                    params[field] = str(value)
                elif field in ["description", "due_date", "priority", "completion_notes"]:
                    update_fields.append(f"{field} = :{field}")
                    params[field] = value
        
        if update_fields:
            update_query = text(f"""
                UPDATE tasks 
                SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
                WHERE task_id = :task_id
            """)
            
            db.execute(update_query, params)
        
        db.commit()
        
        return await get_task(task_id, current_user, db)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update task: {str(e)}"
        )

@router.delete("/{task_id}", response_model=MessageResponse)
async def delete_task(
    task_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete task (creator or admin only)."""
    # Check if task exists and user has permission
    task_check = text("""
        SELECT t.assigned_by, l.owner_id
        FROM tasks t
        JOIN lands l ON t.land_id = l.land_id
        WHERE t.task_id = :task_id
    """)
    
    task_result = db.execute(task_check, {"task_id": str(task_id)}).fetchone()
    
    if not task_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    user_roles = current_user.get("roles", [])
    task_data = {
        "assigned_by": task_result.assigned_by,
        "owner_id": task_result.owner_id
    }
    
    if not can_manage_task(user_roles, current_user["user_id"], task_data):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this task"
        )
    
    try:
        # Delete task history first (foreign key constraint)
        delete_history = text("DELETE FROM task_history WHERE task_id = :task_id")
        db.execute(delete_history, {"task_id": str(task_id)})
        
        # Delete task
        delete_task_query = text("DELETE FROM tasks WHERE task_id = :task_id")
        db.execute(delete_task_query, {"task_id": str(task_id)})
        
        db.commit()
        
        return MessageResponse(message="Task deleted successfully")
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete task: {str(e)}"
        )

@router.get("/{task_id}/history", response_model=List[TaskHistoryResponse])
async def get_task_history(
    task_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get task history."""
    # Check if task exists and user has permission
    task_check = text("""
        SELECT t.assigned_to, t.assigned_by, l.owner_id
        FROM tasks t
        JOIN lands l ON t.land_id = l.land_id
        WHERE t.task_id = :task_id
    """)
    
    task_result = db.execute(task_check, {"task_id": str(task_id)}).fetchone()
    
    if not task_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    user_roles = current_user.get("roles", [])
    task_data = {
        "assigned_by": task_result.assigned_by,
        "assigned_to": task_result.assigned_to,
        "owner_id": task_result.owner_id
    }
    
    if not can_access_task(user_roles, current_user["user_id"], task_data):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view task history"
        )
    
    # Get task history
    history_query = text("""
        SELECT th.history_id, th.task_id, th.changed_by, th.old_status,
               th.new_status, th.notes, th.changed_at,
               u.first_name || ' ' || u.last_name as changed_by_name
        FROM task_history th
        JOIN users u ON th.changed_by = u.user_id
        WHERE th.task_id = :task_id
        ORDER BY th.changed_at DESC
    """)
    
    results = db.execute(history_query, {"task_id": str(task_id)}).fetchall()
    
    return [
        TaskHistoryResponse(
            history_id=row.history_id,
            task_id=row.task_id,
            changed_by=row.changed_by,
            old_status=row.old_status,
            new_status=row.new_status,
            notes=row.notes,
            changed_at=row.changed_at,
            changed_by_name=row.changed_by_name
        )
        for row in results
    ]

@router.get("/assigned/me", response_model=List[TaskResponse])
async def get_my_tasks(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get tasks assigned to the current user."""
    base_query = """
        SELECT t.task_id, t.land_id, t.task_type, t.description,
               t.assigned_to, t.assigned_by, t.status, t.priority,
               t.due_date, t.completion_notes, t.created_at, t.updated_at,
               l.title as land_title, l.owner_id,
               u1.first_name || ' ' || u1.last_name as assigned_to_name,
               u2.first_name || ' ' || u2.last_name as assigned_by_name
        FROM tasks t
        JOIN lands l ON t.land_id = l.land_id
        LEFT JOIN users u1 ON t.assigned_to = u1.user_id
        LEFT JOIN users u2 ON t.assigned_by = u2.user_id
        WHERE t.assigned_to = :user_id
    """
    
    params = {"user_id": current_user["user_id"]}
    
    if status:
        base_query += " AND t.status = :status"
        params["status"] = status
    
    base_query += " ORDER BY t.due_date ASC, t.created_at DESC"
    
    results = db.execute(text(base_query), params).fetchall()
    
    return [
        TaskResponse(
            task_id=row.task_id,
            land_id=row.land_id,
            task_type=row.task_type,
            description=row.description,
            assigned_to=row.assigned_to,
            assigned_by=row.assigned_by,
            status=row.status,
            priority=row.priority,
            due_date=row.due_date,
            completion_notes=row.completion_notes,
            created_at=row.created_at,
            updated_at=row.updated_at,
            land_title=row.land_title,
            assigned_to_name=row.assigned_to_name,
            assigned_by_name=row.assigned_by_name
        )
        for row in results
    ]

@router.get("/created/me", response_model=List[TaskResponse])
async def get_tasks_created_by_me(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get tasks created by the current user."""
    base_query = """
        SELECT t.task_id, t.land_id, t.task_type, t.description,
               t.assigned_to, t.assigned_by, t.status, t.priority,
               t.due_date, t.completion_notes, t.created_at, t.updated_at,
               l.title as land_title, l.owner_id,
               u1.first_name || ' ' || u1.last_name as assigned_to_name,
               u2.first_name || ' ' || u2.last_name as assigned_by_name
        FROM tasks t
        JOIN lands l ON t.land_id = l.land_id
        LEFT JOIN users u1 ON t.assigned_to = u1.user_id
        LEFT JOIN users u2 ON t.assigned_by = u2.user_id
        WHERE t.assigned_by = :user_id
    """
    
    params = {"user_id": current_user["user_id"]}
    
    if status:
        base_query += " AND t.status = :status"
        params["status"] = status
    
    base_query += " ORDER BY t.created_at DESC"
    
    results = db.execute(text(base_query), params).fetchall()
    
    return [
        TaskResponse(
            task_id=row.task_id,
            land_id=row.land_id,
            task_type=row.task_type,
            description=row.description,
            assigned_to=row.assigned_to,
            assigned_by=row.assigned_by,
            status=row.status,
            priority=row.priority,
            due_date=row.due_date,
            completion_notes=row.completion_notes,
            created_at=row.created_at,
            updated_at=row.updated_at,
            land_title=row.land_title,
            assigned_to_name=row.assigned_to_name,
            assigned_by_name=row.assigned_by_name
        )
        for row in results
    ]

# Admin endpoints
@router.get("/admin/all", response_model=List[TaskResponse])
async def get_all_tasks(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    task_type: Optional[str] = None,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all tasks (admin only)."""
    base_query = """
        SELECT t.task_id, t.land_id, t.task_type, t.description,
               t.assigned_to, t.assigned_by, t.status, t.priority,
               t.due_date, t.completion_notes, t.created_at, t.updated_at,
               l.title as land_title, l.owner_id,
               u1.first_name || ' ' || u1.last_name as assigned_to_name,
               u2.first_name || ' ' || u2.last_name as assigned_by_name
        FROM tasks t
        JOIN lands l ON t.land_id = l.land_id
        LEFT JOIN users u1 ON t.assigned_to = u1.user_id
        LEFT JOIN users u2 ON t.assigned_by = u2.user_id
        WHERE 1=1
    """
    
    params = {"skip": skip, "limit": limit}
    
    if status:
        base_query += " AND t.status = :status"
        params["status"] = status
    
    if task_type:
        base_query += " AND t.task_type = :task_type"
        params["task_type"] = task_type
    
    base_query += " ORDER BY t.created_at DESC OFFSET :skip LIMIT :limit"
    
    results = db.execute(text(base_query), params).fetchall()
    
    return [
        TaskResponse(
            task_id=row.task_id,
            land_id=row.land_id,
            task_type=row.task_type,
            description=row.description,
            assigned_to=row.assigned_to,
            assigned_by=row.assigned_by,
            status=row.status,
            priority=row.priority,
            due_date=row.due_date,
            completion_notes=row.completion_notes,
            created_at=row.created_at,
            updated_at=row.updated_at,
            land_title=row.land_title,
            assigned_to_name=row.assigned_to_name,
            assigned_by_name=row.assigned_by_name
        )
        for row in results
    ]

@router.get("/types/list", response_model=List[str])
async def get_task_types(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of all task types in use."""
    query = text("""
        SELECT DISTINCT task_type 
        FROM tasks 
        ORDER BY task_type
    """)
    
    results = db.execute(query).fetchall()
    
    return [row.task_type for row in results]

@router.get("/status/list", response_model=List[str])
async def get_task_statuses(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of all task statuses."""
    # Return standard task statuses
    return ["pending", "in_progress", "completed", "cancelled", "on_hold"]

@router.get("/priority/list", response_model=List[str])
async def get_task_priorities(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of all task priorities."""
    # Return standard task priorities
    return ["low", "medium", "high", "urgent"]

@router.get("/stats/summary")
async def get_task_stats(
    land_id: Optional[UUID] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get task statistics summary."""
    user_roles = current_user.get("roles", [])
    
    base_query = """
        SELECT 
            COUNT(*) as total_tasks,
            COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending_tasks,
            COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as in_progress_tasks,
            COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
            COUNT(CASE WHEN t.due_date < CURRENT_DATE AND t.status NOT IN ('completed', 'cancelled') THEN 1 END) as overdue_tasks
        FROM tasks t
        JOIN lands l ON t.land_id = l.land_id
        WHERE 1=1
    """
    
    params = {}
    
    if land_id:
        base_query += " AND t.land_id = :land_id"
        params["land_id"] = str(land_id)
    
    # Add permission filter for non-admin users
    if "administrator" not in user_roles:
        base_query += """
            AND (t.assigned_to = :user_id 
                 OR t.assigned_by = :user_id 
                 OR l.owner_id = :user_id)
        """
        params["user_id"] = current_user["user_id"]
    
    result = db.execute(text(base_query), params).fetchone()
    
    return {
        "total_tasks": result.total_tasks,
        "pending_tasks": result.pending_tasks,
        "in_progress_tasks": result.in_progress_tasks,
        "completed_tasks": result.completed_tasks,
        "overdue_tasks": result.overdue_tasks
    }