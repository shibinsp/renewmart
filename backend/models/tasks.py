from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid

class Task(Base):
    """Tasks created for land review and processing"""
    __tablename__ = "task"
    
    task_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    land_id = Column(UUID(as_uuid=True), ForeignKey("land.land_id", ondelete="CASCADE"), nullable=False)
    land_section_id = Column(UUID(as_uuid=True), ForeignKey("land_section.land_section_id", ondelete="SET NULL"), nullable=True)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    assigned_role = Column(String, ForeignKey("lu_roles.role_key"), nullable=True)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=True)
    status = Column(String, ForeignKey("lu_task_status.status_key"), nullable=False, default='assigned')
    priority = Column(Text, default='medium')
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    land = relationship("Land", back_populates="tasks")
    land_section = relationship("LandSection", back_populates="tasks")
    assigned_role_ref = relationship("LuRole")
    assigned_user = relationship("User", back_populates="assigned_tasks", foreign_keys=[assigned_to])
    creator = relationship("User", back_populates="created_tasks", foreign_keys=[created_by])
    status_ref = relationship("LuTaskStatus")
    history = relationship("TaskHistory", back_populates="task", cascade="all, delete-orphan")

class TaskHistory(Base):
    """Immutable history rows for task status changes (append-only)"""
    __tablename__ = "task_history"
    
    history_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(UUID(as_uuid=True), ForeignKey("task.task_id", ondelete="CASCADE"), nullable=False)
    changed_by = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=True)
    from_status = Column(String, ForeignKey("lu_task_status.status_key"), nullable=True)
    to_status = Column(String, ForeignKey("lu_task_status.status_key"), nullable=True)
    start_ts = Column(DateTime(timezone=True), server_default=func.now())
    end_ts = Column(DateTime(timezone=True), nullable=True)
    note = Column(Text, nullable=True)
    
    # Relationships
    task = relationship("Task", back_populates="history")
    changed_by_user = relationship("User")
    from_status_ref = relationship("LuTaskStatus", foreign_keys=[from_status])
    to_status_ref = relationship("LuTaskStatus", foreign_keys=[to_status])