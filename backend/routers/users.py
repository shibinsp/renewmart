from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.users import User, UserRole
from models.lookup_tables import LuRole
from routers.auth import get_current_user
from pydantic import BaseModel, EmailStr

router = APIRouter()

# Pydantic models
class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    user_id: str
    email: str
    first_name: str
    last_name: str
    phone: Optional[str]
    is_active: bool
    roles: List[str]
    created_at: str
    
    class Config:
        from_attributes = True

class RoleAssignment(BaseModel):
    user_id: str
    role_key: str

# Helper functions
def get_user_with_roles(db: Session, user_id: str):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        return None
    
    user_roles = db.query(UserRole).filter(UserRole.user_id == user.user_id).all()
    roles = [ur.role_key for ur in user_roles]
    
    return {
        "user_id": str(user.user_id),
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
        "is_active": user.is_active,
        "roles": roles,
        "created_at": user.created_at.isoformat()
    }

# API endpoints
@router.get("/", response_model=List[UserResponse])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    # Check if current user has admin role
    user_roles = db.query(UserRole).filter(UserRole.user_id == current_user.user_id).all()
    roles = [ur.role_key for ur in user_roles]
    
    if "administrator" not in roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    users = db.query(User).offset(skip).limit(limit).all()
    result = []
    
    for user in users:
        user_data = get_user_with_roles(db, str(user.user_id))
        if user_data:
            result.append(UserResponse(**user_data))
    
    return result

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user by ID"""
    # Users can only view their own profile unless they're admin
    user_roles = db.query(UserRole).filter(UserRole.user_id == current_user.user_id).all()
    roles = [ur.role_key for ur in user_roles]
    
    if str(current_user.user_id) != user_id and "administrator" not in roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user_data = get_user_with_roles(db, user_id)
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(**user_data)

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user information"""
    # Users can only update their own profile unless they're admin
    user_roles = db.query(UserRole).filter(UserRole.user_id == current_user.user_id).all()
    roles = [ur.role_key for ur in user_roles]
    
    if str(current_user.user_id) != user_id and "administrator" not in roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user fields
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    user_data = get_user_with_roles(db, user_id)
    return UserResponse(**user_data)

@router.post("/{user_id}/roles", response_model=dict)
async def assign_role(
    user_id: str,
    role_assignment: RoleAssignment,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assign role to user (admin only)"""
    # Check if current user has admin role
    user_roles = db.query(UserRole).filter(UserRole.user_id == current_user.user_id).all()
    roles = [ur.role_key for ur in user_roles]
    
    if "administrator" not in roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check if user exists
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if role exists
    role = db.query(LuRole).filter(LuRole.role_key == role_assignment.role_key).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    # Check if user already has this role
    existing_role = db.query(UserRole).filter(
        UserRole.user_id == user_id,
        UserRole.role_key == role_assignment.role_key
    ).first()
    
    if existing_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has this role"
        )
    
    # Assign role
    user_role = UserRole(user_id=user_id, role_key=role_assignment.role_key)
    db.add(user_role)
    db.commit()
    
    return {"message": f"Role {role_assignment.role_key} assigned to user {user_id}"}

@router.delete("/{user_id}/roles/{role_key}", response_model=dict)
async def remove_role(
    user_id: str,
    role_key: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove role from user (admin only)"""
    # Check if current user has admin role
    user_roles = db.query(UserRole).filter(UserRole.user_id == current_user.user_id).all()
    roles = [ur.role_key for ur in user_roles]
    
    if "administrator" not in roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Find and remove the role assignment
    user_role = db.query(UserRole).filter(
        UserRole.user_id == user_id,
        UserRole.role_key == role_key
    ).first()
    
    if not user_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role assignment not found"
        )
    
    db.delete(user_role)
    db.commit()
    
    return {"message": f"Role {role_key} removed from user {user_id}"}

@router.get("/roles/available", response_model=List[dict])
async def get_available_roles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all available roles"""
    roles = db.query(LuRole).all()
    return [{"role_key": role.role_key, "label": role.label} for role in roles]