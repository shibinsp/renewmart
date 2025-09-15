from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid


class Document(Base):
    """Document model"""
    __tablename__ = "documents"
    
    document_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    land_id = Column(UUID(as_uuid=True), ForeignKey("lands.land_id", ondelete="CASCADE"))
    land_section_id = Column(UUID(as_uuid=True), ForeignKey("land_sections.land_section_id", ondelete="CASCADE"))
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer)
    mime_type = Column(String)
    description = Column(Text)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("user.user_id"), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    land = relationship("Land", back_populates="documents")
    land_section = relationship("LandSection", back_populates="documents")
    uploader = relationship("User", back_populates="uploaded_documents")