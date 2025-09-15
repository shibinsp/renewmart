from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid


class Task(Base):
    """Task model"""
    __tablename__ = "tasks"
    
    task_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    land_id = Column(UUID(as_uuid=True), ForeignKey("lands.land_id", ondelete="CASCADE"))
    land_section_id = Column(UUID(as_uuid=True), ForeignKey("land_sections.land_section_id", ondelete="CASCADE"))
    title = Column(String, nullable=False)
    description = Column(Text)
    assigned_role = Column(String, ForeignKey("lu_roles.role_key"))
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("user.user_id"))
    status = Column(String, ForeignKey("lu_task_status.status_key"), nullable=False, default='assigned')
    start_date = Column(Date)
    end_date = Column(Date)
    created_by = Column(UUID(as_uuid=True), ForeignKey("user.user_id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    land = relationship("Land", back_populates="tasks")
    land_section = relationship("LandSection", back_populates="tasks")
    assigned_role_ref = relationship("LuRole")
    assigned_user = relationship("User", foreign_keys=[assigned_to], back_populates="assigned_tasks")
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_tasks")
    status_ref = relationship("LuTaskStatus")
    history = relationship("TaskHistory", back_populates="task", cascade="all, delete-orphan")


class TaskHistory(Base):
    """Task history model"""
    __tablename__ = "task_history"
    
    history_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.task_id", ondelete="CASCADE"), nullable=False)
    old_status = Column(String)
    new_status = Column(String, nullable=False)
    changed_by = Column(UUID(as_uuid=True), ForeignKey("user.user_id"), nullable=False)
    comments = Column(Text)
    start_ts = Column(DateTime(timezone=True), server_default=func.now())
    end_ts = Column(DateTime(timezone=True))
    
    # Relationships
    task = relationship("Task", back_populates="history")
    changed_by_user = relationship("User")