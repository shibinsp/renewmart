from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, Integer, Numeric, BigInteger
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid

class Land(Base):
    """Main land record for renewable energy projects"""
    __tablename__ = "land"
    
    land_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    landowner_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    title = Column(Text, nullable=False)
    location_text = Column(Text, nullable=True)
    coordinates = Column(JSONB, nullable=True)  # {lat:..., lng:...}
    area_acres = Column(Numeric(10, 2), nullable=True)
    land_type = Column(Text, nullable=True)  # soil/terrain etc
    status = Column(String, ForeignKey("lu_status.status_key"), nullable=False, default='draft')
    admin_notes = Column(Text, nullable=True)
    energy_key = Column(String, ForeignKey("lu_energy_type.energy_key"), nullable=True)
    capacity_mw = Column(Numeric(12, 2), nullable=True)
    price_per_mwh = Column(Numeric(12, 2), nullable=True)
    timeline_text = Column(Text, nullable=True)
    contract_term_years = Column(Integer, nullable=True)
    developer_name = Column(Text, nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    interest_locked_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    landowner = relationship("User", back_populates="owned_lands", foreign_keys=[landowner_id])
    status_ref = relationship("LuStatus")
    energy_type = relationship("LuEnergyType")
    sections = relationship("LandSection", back_populates="land", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="land", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="land", cascade="all, delete-orphan")
    investor_interests = relationship("InvestorInterest", back_populates="land", cascade="all, delete-orphan")

class LandSection(Base):
    """Accordion sections for each land record"""
    __tablename__ = "land_section"
    
    land_section_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    land_id = Column(UUID(as_uuid=True), ForeignKey("land.land_id", ondelete="CASCADE"), nullable=False)
    section_key = Column(String, ForeignKey("section_definitions.section_key"), nullable=False)
    status = Column(String, ForeignKey("lu_status.status_key"), nullable=False, default='draft')
    assigned_role = Column(String, ForeignKey("lu_roles.role_key"), nullable=True)
    assigned_user = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=True)
    data = Column(JSONB, nullable=True)  # actual fields captured for the accordion section
    reviewer_comments = Column(Text, nullable=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    rejected_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    land = relationship("Land", back_populates="sections")
    section_definition = relationship("SectionDefinition")
    status_ref = relationship("LuStatus")
    assigned_role_ref = relationship("LuRole")
    assigned_user = relationship("User", back_populates="assigned_sections")
    documents = relationship("Document", back_populates="land_section", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="land_section")

class Document(Base):
    """Documents attached to land or section level"""
    __tablename__ = "document"
    
    document_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    land_id = Column(UUID(as_uuid=True), ForeignKey("land.land_id", ondelete="CASCADE"), nullable=True)
    land_section_id = Column(UUID(as_uuid=True), ForeignKey("land_section.land_section_id", ondelete="CASCADE"), nullable=True)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=True)
    document_type = Column(Text, nullable=True)  # 'ownership_deed','survey','grid_letter', etc.
    file_name = Column(Text, nullable=False)
    file_path = Column(Text, nullable=False)
    file_size = Column(BigInteger, nullable=True)
    mime_type = Column(Text, nullable=True)
    is_draft = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    land = relationship("Land", back_populates="documents")
    land_section = relationship("LandSection", back_populates="documents")
    uploader = relationship("User", back_populates="uploaded_documents")