from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid

class User(Base):
    """User model for authentication and profile management"""
    __tablename__ = "users"
    
    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(Text, unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    first_name = Column(Text, nullable=False)
    last_name = Column(Text, nullable=False)
    phone = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user_roles = relationship("UserRole", back_populates="user", cascade="all, delete-orphan")
    owned_lands = relationship("Land", back_populates="landowner", foreign_keys="Land.landowner_id")
    assigned_tasks = relationship("Task", back_populates="assigned_user", foreign_keys="Task.assigned_to")
    created_tasks = relationship("Task", back_populates="creator", foreign_keys="Task.created_by")
    uploaded_documents = relationship("Document", back_populates="uploader")
    investor_interests = relationship("InvestorInterest", back_populates="investor")
    assigned_sections = relationship("LandSection", back_populates="assigned_user")

class UserRole(Base):
    """Many-to-many relationship between users and roles"""
    __tablename__ = "user_roles"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    role_key = Column(String, ForeignKey("lu_roles.role_key"), primary_key=True)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="user_roles")
    role = relationship("LuRole")