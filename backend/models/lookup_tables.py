from sqlalchemy import Column, String
from database import Base


class LuRole(Base):
    """Lookup table for user roles"""
    __tablename__ = "lu_roles"
    
    role_key = Column(String, primary_key=True)
    label = Column(String, nullable=False)


class LuStatus(Base):
    """Lookup table for status values"""
    __tablename__ = "lu_status"
    
    status_key = Column(String, primary_key=True)
    scope = Column(String, nullable=False)


class LuTaskStatus(Base):
    """Lookup table for task status values"""
    __tablename__ = "lu_task_status"
    
    status_key = Column(String, primary_key=True)


class LuEnergyType(Base):
    """Lookup table for energy types"""
    __tablename__ = "lu_energy_type"
    
    energy_key = Column(String, primary_key=True)