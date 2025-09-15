from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from datetime import timedelta
from uuid import UUID

from database import get_db
from models.schemas import (
    User, UserCreate, UserUpdate, UserLogin, Token, MessageResponse,
    UserRole, UserRoleCreate, LuRole
)
from auth import (
    get_password_hash, authenticate_user, create_access_token,
    get_current_active_user, require_admin, ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    check_query = text("SELECT user_id FROM \"user\" WHERE email = :email")
    existing_user = db.execute(check_query, {"email": user_data.email}).fetchone()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user
    insert_query = text("""
        INSERT INTO \"user\" (email, password_hash, first_name, last_name, phone, is_active)
        VALUES (:email, :password_hash, :first_name, :last_name, :phone, :is_active)
        RETURNING user_id, email, first_name, last_name, phone, is_active, created_at, updated_at
    """)
    
    result = db.execute(insert_query, {
        "email": user_data.email,
        "password_hash": hashed_password,
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "phone": user_data.phone,
        "is_active": user_data.is_active
    }).fetchone()
    
    db.commit()
    
    return User(
        user_id=result.user_id,
        email=result.email,
        first_name=result.first_name,
        last_name=result.last_name,
        phone=result.phone,
        is_active=result.is_active,
        created_at=result.created_at,
        updated_at=result.updated_at
    )

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return access token."""
    user = authenticate_user(db, user_credentials.email, user_credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["user_id"]), "roles": user["roles"]},
        expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token, token_type="bearer")

@router.get("/me", response_model=User)
async def get_current_user_profile(current_user: dict = Depends(get_current_active_user)):
    """Get current user profile."""
    return User(
        user_id=current_user["user_id"],
        email=current_user["email"],
        first_name=current_user["first_name"],
        last_name=current_user["last_name"],
        phone=current_user["phone"],
        is_active=current_user["is_active"],
        created_at=current_user["created_at"],
        updated_at=current_user["updated_at"]
    )

@router.put("/me", response_model=User)
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user profile."""
    # Build update query dynamically
    update_fields = []
    params = {"user_id": str(current_user["user_id"])}
    
    if user_update.email is not None:
        # Check if email is already taken by another user
        check_query = text("SELECT user_id FROM \"user\" WHERE email = :email AND user_id != :user_id")
        existing = db.execute(check_query, {"email": user_update.email, "user_id": str(current_user["user_id"])}).fetchone()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already taken"
            )
        update_fields.append("email = :email")
        params["email"] = user_update.email
    
    if user_update.first_name is not None:
        update_fields.append("first_name = :first_name")
        params["first_name"] = user_update.first_name
    
    if user_update.last_name is not None:
        update_fields.append("last_name = :last_name")
        params["last_name"] = user_update.last_name
    
    if user_update.phone is not None:
        update_fields.append("phone = :phone")
        params["phone"] = user_update.phone
    
    if user_update.is_active is not None:
        update_fields.append("is_active = :is_active")
        params["is_active"] = user_update.is_active
    
    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    update_query = text(f"""
        UPDATE \"user\" 
        SET {', '.join(update_fields)}, updated_at = now()
        WHERE user_id = :user_id
        RETURNING user_id, email, first_name, last_name, phone, is_active, created_at, updated_at
    """)
    
    result = db.execute(update_query, params).fetchone()
    db.commit()
    
    return User(
        user_id=result.user_id,
        email=result.email,
        first_name=result.first_name,
        last_name=result.last_name,
        phone=result.phone,
        is_active=result.is_active,
        created_at=result.created_at,
        updated_at=result.updated_at
    )

@router.get("/", response_model=List[User])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """List all users (admin only)."""
    query = text("""
        SELECT user_id, email, first_name, last_name, phone, is_active, created_at, updated_at
        FROM \"user\"
        ORDER BY created_at DESC
        OFFSET :skip LIMIT :limit
    """)
    
    results = db.execute(query, {"skip": skip, "limit": limit}).fetchall()
    
    return [
        User(
            user_id=row.user_id,
            email=row.email,
            first_name=row.first_name,
            last_name=row.last_name,
            phone=row.phone,
            is_active=row.is_active,
            created_at=row.created_at,
            updated_at=row.updated_at
        )
        for row in results
    ]

@router.get("/{user_id}", response_model=User)
async def get_user(
    user_id: UUID,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get user by ID (admin only)."""
    query = text("""
        SELECT user_id, email, first_name, last_name, phone, is_active, created_at, updated_at
        FROM \"user\"
        WHERE user_id = :user_id
    """)
    
    result = db.execute(query, {"user_id": str(user_id)}).fetchone()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return User(
        user_id=result.user_id,
        email=result.email,
        first_name=result.first_name,
        last_name=result.last_name,
        phone=result.phone,
        is_active=result.is_active,
        created_at=result.created_at,
        updated_at=result.updated_at
    )

@router.post("/{user_id}/roles", response_model=MessageResponse)
async def assign_user_role(
    user_id: UUID,
    role_data: UserRoleCreate,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Assign a role to a user (admin only)."""
    # Check if user exists
    user_check = text("SELECT user_id FROM \"user\" WHERE user_id = :user_id")
    if not db.execute(user_check, {"user_id": str(user_id)}).fetchone():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if role exists
    role_check = text("SELECT role_key FROM lu_roles WHERE role_key = :role_key")
    if not db.execute(role_check, {"role_key": role_data.role_key}).fetchone():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    # Assign role (ignore if already exists)
    insert_query = text("""
        INSERT INTO user_roles (user_id, role_key)
        VALUES (:user_id, :role_key)
        ON CONFLICT (user_id, role_key) DO NOTHING
    """)
    
    db.execute(insert_query, {
        "user_id": str(user_id),
        "role_key": role_data.role_key
    })
    db.commit()
    
    return MessageResponse(message="Role assigned successfully")

@router.delete("/{user_id}/roles/{role_key}", response_model=MessageResponse)
async def remove_user_role(
    user_id: UUID,
    role_key: str,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Remove a role from a user (admin only)."""
    delete_query = text("""
        DELETE FROM user_roles 
        WHERE user_id = :user_id AND role_key = :role_key
    """)
    
    result = db.execute(delete_query, {
        "user_id": str(user_id),
        "role_key": role_key
    })
    db.commit()
    
    if result.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User role assignment not found"
        )
    
    return MessageResponse(message="Role removed successfully")

@router.get("/{user_id}/roles", response_model=List[UserRole])
async def get_user_roles(
    user_id: UUID,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all roles for a user (admin only)."""
    query = text("""
        SELECT user_id, role_key, assigned_at
        FROM user_roles
        WHERE user_id = :user_id
        ORDER BY assigned_at
    """)
    
    results = db.execute(query, {"user_id": str(user_id)}).fetchall()
    
    return [
        UserRole(
            user_id=row.user_id,
            role_key=row.role_key,
            assigned_at=row.assigned_at
        )
        for row in results
    ]

@router.get("/roles/available", response_model=List[LuRole])
async def get_available_roles(
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all available roles (admin only)."""
    query = text("SELECT role_key, label FROM lu_roles ORDER BY label")
    results = db.execute(query).fetchall()
    
    return [
        LuRole(role_key=row.role_key, label=row.label)
        for row in results
    ]