from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid


class SectionDefinition(Base):
    """Section definition model"""
    __tablename__ = "section_definitions"
    
    section_key = Column(String, primary_key=True)
    label = Column(String, nullable=False)
    default_role_reviewer = Column(String, ForeignKey("lu_roles.role_key"))
    
    # Relationships
    default_reviewer_role = relationship("LuRole")
    land_sections = relationship("LandSection", back_populates="section_definition")


class Land(Base):
    """Land model"""
    __tablename__ = "lands"
    
    land_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    landowner_id = Column(UUID(as_uuid=True), ForeignKey("user.user_id"), nullable=False)
    title = Column(String, nullable=False)
    location_text = Column(String)
    coordinates = Column(JSONB)
    area_acres = Column(Numeric(10, 2))
    land_type = Column(String)
    status = Column(String, ForeignKey("lu_status.status_key"), nullable=False, default='draft')
    admin_notes = Column(Text)
    energy_key = Column(String, ForeignKey("lu_energy_type.energy_key"))
    capacity_mw = Column(Numeric(12, 2))
    price_per_mwh = Column(Numeric(12, 2))
    timeline_text = Column(String)
    contract_term_years = Column(Integer)
    developer_name = Column(String)
    published_at = Column(DateTime(timezone=True))
    interest_locked_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    landowner = relationship("User", back_populates="lands")
    status_ref = relationship("LuStatus")
    energy_type = relationship("LuEnergyType")
    sections = relationship("LandSection", back_populates="land", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="land")
    tasks = relationship("Task", back_populates="land")
    investor_interests = relationship("InvestorInterest", back_populates="land")


class LandSection(Base):
    """Land section model"""
    __tablename__ = "land_sections"
    
    land_section_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    land_id = Column(UUID(as_uuid=True), ForeignKey("lands.land_id", ondelete="CASCADE"), nullable=False)
    section_key = Column(String, ForeignKey("section_definitions.section_key"), nullable=False)
    status = Column(String, ForeignKey("lu_status.status_key"), nullable=False, default='draft')
    assigned_role = Column(String, ForeignKey("lu_roles.role_key"))
    assigned_user = Column(UUID(as_uuid=True), ForeignKey("user.user_id"))
    data = Column(JSONB)
    reviewer_comments = Column(Text)
    submitted_at = Column(DateTime(timezone=True))
    approved_at = Column(DateTime(timezone=True))
    rejected_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    land = relationship("Land", back_populates="sections")
    section_definition = relationship("SectionDefinition", back_populates="land_sections")
    status_ref = relationship("LuStatus")
    assigned_role_ref = relationship("LuRole")
    assigned_user_ref = relationship("User")
    documents = relationship("Document", back_populates="land_section")
    tasks = relationship("Task", back_populates="land_section")