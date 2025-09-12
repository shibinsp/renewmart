from sqlalchemy import Column, String, Text
from database import Base

class LuRole(Base):
    """Lookup table for user roles"""
    __tablename__ = "lu_roles"
    
    role_key = Column(String(50), primary_key=True)
    label = Column(String(100), nullable=False)

class LuStatus(Base):
    """Lookup table for generic statuses"""
    __tablename__ = "lu_status"
    
    status_key = Column(String(50), primary_key=True)
    scope = Column(String(100), nullable=False)  # 'land','section','task','project','investor_interest'

class LuTaskStatus(Base):
    """Lookup table for task statuses"""
    __tablename__ = "lu_task_status"
    
    status_key = Column(String(50), primary_key=True)

class LuEnergyType(Base):
    """Lookup table for energy types"""
    __tablename__ = "lu_energy_type"
    
    energy_key = Column(String(50), primary_key=True)

class SectionDefinition(Base):
    """Section definitions for accordion sections"""
    __tablename__ = "section_definitions"
    
    section_key = Column(String, primary_key=True)
    label = Column(Text, nullable=False)
    default_role_reviewer = Column(String, nullable=True)