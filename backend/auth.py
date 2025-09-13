from datetime import datetime, timedelta
from typing import Optional, List
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from models.schemas import TokenData, User
import os
from uuid import UUID

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Bearer token
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[TokenData]:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        roles: List[str] = payload.get("roles", [])
        
        if user_id is None:
            return None
            
        token_data = TokenData(user_id=UUID(user_id), roles=roles)
        return token_data
    except JWTError:
        return None

def authenticate_user(db: Session, email: str, password: str) -> Optional[dict]:
    """Authenticate a user with email and password."""
    # Get user with roles
    query = text("""
        SELECT u.user_id, u.email, u.password_hash, u.first_name, u.last_name,
               u.phone, u.is_active, u.created_at, u.updated_at,
               COALESCE(array_agg(ur.role_key) FILTER (WHERE ur.role_key IS NOT NULL), '{}') as roles
        FROM "user" u
        LEFT JOIN user_roles ur ON u.user_id = ur.user_id
        WHERE u.email = :email AND u.is_active = true
        GROUP BY u.user_id, u.email, u.password_hash, u.first_name, u.last_name,
                 u.phone, u.is_active, u.created_at, u.updated_at
    """)
    
    result = db.execute(query, {"email": email}).fetchone()
    
    if not result:
        return None
        
    if not verify_password(password, result.password_hash):
        return None
        
    return {
        "user_id": result.user_id,
        "email": result.email,
        "first_name": result.first_name,
        "last_name": result.last_name,
        "phone": result.phone,
        "is_active": result.is_active,
        "created_at": result.created_at,
        "updated_at": result.updated_at,
        "roles": result.roles
    }

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> dict:
    """Get the current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = verify_token(credentials.credentials)
    if token_data is None:
        raise credentials_exception
        
    # Get user from database
    query = text("""
        SELECT u.user_id, u.email, u.first_name, u.last_name, u.phone, u.is_active,
               u.created_at, u.updated_at,
               COALESCE(array_agg(ur.role_key) FILTER (WHERE ur.role_key IS NOT NULL), '{}') as roles
        FROM "user" u
        LEFT JOIN user_roles ur ON u.user_id = ur.user_id
        WHERE u.user_id = :user_id AND u.is_active = true
        GROUP BY u.user_id, u.email, u.first_name, u.last_name, u.phone, u.is_active,
                 u.created_at, u.updated_at
    """)
    
    result = db.execute(query, {"user_id": str(token_data.user_id)}).fetchone()
    
    if result is None:
        raise credentials_exception
        
    return {
        "user_id": result.user_id,
        "email": result.email,
        "first_name": result.first_name,
        "last_name": result.last_name,
        "phone": result.phone,
        "is_active": result.is_active,
        "created_at": result.created_at,
        "updated_at": result.updated_at,
        "roles": result.roles
    }

def get_current_active_user(current_user: dict = Depends(get_current_user)) -> dict:
    """Get the current active user."""
    if not current_user["is_active"]:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Role-based access control decorators
def require_roles(allowed_roles: List[str]):
    """Decorator to require specific roles."""
    def role_checker(current_user: dict = Depends(get_current_active_user)) -> dict:
        user_roles = current_user.get("roles", [])
        if not any(role in user_roles for role in allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return role_checker

# Specific role dependencies
def require_admin(current_user: dict = Depends(get_current_active_user)) -> dict:
    """Require administrator role."""
    if "administrator" not in current_user.get("roles", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required"
        )
    return current_user

def require_landowner(current_user: dict = Depends(get_current_active_user)) -> dict:
    """Require landowner role."""
    if "landowner" not in current_user.get("roles", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Landowner access required"
        )
    return current_user

def require_investor(current_user: dict = Depends(get_current_active_user)) -> dict:
    """Require investor role."""
    if "investor" not in current_user.get("roles", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Investor access required"
        )
    return current_user

def require_reviewer(current_user: dict = Depends(get_current_active_user)) -> dict:
    """Require any reviewer role (re_sales_advisor, re_analyst, re_governance_lead)."""
    reviewer_roles = ["re_sales_advisor", "re_analyst", "re_governance_lead"]
    user_roles = current_user.get("roles", [])
    if not any(role in user_roles for role in reviewer_roles):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Reviewer access required"
        )
    return current_user

def require_admin_or_reviewer(current_user: dict = Depends(get_current_active_user)) -> dict:
    """Require administrator or any reviewer role."""
    allowed_roles = ["administrator", "re_sales_advisor", "re_analyst", "re_governance_lead"]
    user_roles = current_user.get("roles", [])
    if not any(role in user_roles for role in allowed_roles):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator or reviewer access required"
        )
    return current_user

def check_land_ownership(land_id: UUID, current_user: dict, db: Session) -> bool:
    """Check if the current user owns the specified land."""
    query = text("SELECT landowner_id FROM lands WHERE land_id = :land_id")
    result = db.execute(query, {"land_id": str(land_id)}).fetchone()
    
    if not result:
        return False
        
    return result.landowner_id == current_user["user_id"]

def check_section_assignment(land_section_id: UUID, current_user: dict, db: Session) -> bool:
    """Check if the current user is assigned to the specified section."""
    query = text("""
        SELECT assigned_user, assigned_role 
        FROM land_sections 
        WHERE land_section_id = :land_section_id
    """)
    result = db.execute(query, {"land_section_id": str(land_section_id)}).fetchone()
    
    if not result:
        return False
        
    # Check if user is directly assigned or has the assigned role
    user_roles = current_user.get("roles", [])
    return (result.assigned_user == current_user["user_id"] or 
            result.assigned_role in user_roles)

def check_task_assignment(task_id: UUID, current_user: dict, db: Session) -> bool:
    """Check if the current user is assigned to the specified task."""
    query = text("""
        SELECT assigned_to, assigned_role 
        FROM tasks 
        WHERE task_id = :task_id
    """)
    result = db.execute(query, {"task_id": str(task_id)}).fetchone()
    
    if not result:
        return False
        
    # Check if user is directly assigned or has the assigned role
    user_roles = current_user.get("roles", [])
    return (result.assigned_to == current_user["user_id"] or 
            result.assigned_role in user_roles)