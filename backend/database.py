from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from config import settings
from typing import Optional
from uuid import UUID

# Get database URL from Dynaconf settings
DATABASE_URL = settings.DATABASE_URL

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    echo=settings.get('DATABASE_ECHO', False),  # Use settings for echo
    pool_size=settings.get('DATABASE_POOL_SIZE', 10),
    max_overflow=settings.get('DATABASE_MAX_OVERFLOW', 20),
    pool_pre_ping=True
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Helper function to get user by email (for auth compatibility)
def get_user_by_email(db: Session, email: str) -> Optional[dict]:
    """Get user by email address."""
    query = text("""
        SELECT u.user_id, u.email, u.password_hash, u.first_name, u.last_name,
               u.phone, u.is_active, u.created_at, u.updated_at,
               COALESCE(array_agg(ur.role_key) FILTER (WHERE ur.role_key IS NOT NULL), '{}') as roles
        FROM "user" u
        LEFT JOIN user_roles ur ON u.user_id = ur.user_id
        WHERE u.email = :email
        GROUP BY u.user_id, u.email, u.password_hash, u.first_name, u.last_name,
                 u.phone, u.is_active, u.created_at, u.updated_at
    """)
    
    result = db.execute(query, {"email": email}).fetchone()
    
    if not result:
        return None
        
    return {
        "user_id": result.user_id,
        "email": result.email,
        "password_hash": result.password_hash,
        "first_name": result.first_name,
        "last_name": result.last_name,
        "phone": result.phone,
        "is_active": result.is_active,
        "created_at": result.created_at,
        "updated_at": result.updated_at,
        "roles": result.roles
    }

# Import User model from schemas for compatibility
from models.schemas import User