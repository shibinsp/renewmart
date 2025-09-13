from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Optional
from database import get_db
from models.schemas import UserRole, LuRole
from pydantic import BaseModel, EmailStr
from auth import authenticate_user, create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    roles: list[str] = []

class UserResponse(BaseModel):
    user_id: str
    email: str
    first_name: str
    last_name: str
    phone: Optional[str]
    is_active: bool
    roles: list[str]
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Utility functions imported from auth.py

# API endpoints
@router.post("/register", response_model=UserResponse)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    if get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone=user_data.phone
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Add roles if provided
    for role_key in user_data.roles:
        role = db.query(LuRole).filter(LuRole.role_key == role_key).first()
        if role:
            user_role = UserRole(user_id=db_user.user_id, role_key=role_key)
            db.add(user_role)
    
    db.commit()
    
    # Get user roles for response
    user_roles = db.query(UserRole).filter(UserRole.user_id == db_user.user_id).all()
    roles = [ur.role_key for ur in user_roles]
    
    return UserResponse(
        user_id=str(db_user.user_id),
        email=db_user.email,
        first_name=db_user.first_name,
        last_name=db_user.last_name,
        phone=db_user.phone,
        is_active=db_user.is_active,
        roles=roles
    )

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["user_id"])}, expires_delta=access_token_expires
    )
    
    user_response = UserResponse(
        user_id=str(user["user_id"]),
        email=user["email"],
        first_name=user["first_name"],
        last_name=user["last_name"],
        phone=user["phone"],
        is_active=user["is_active"],
        roles=user["roles"]
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        user_id=str(current_user["user_id"]),
        email=current_user["email"],
        first_name=current_user["first_name"],
        last_name=current_user["last_name"],
        phone=current_user["phone"],
        is_active=current_user["is_active"],
        roles=current_user["roles"]
    )