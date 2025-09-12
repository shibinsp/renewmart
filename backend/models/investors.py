from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid

class InvestorInterest(Base):
    """Investor interests in published land listings"""
    __tablename__ = "investor_interest"
    
    interest_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    investor_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    land_id = Column(UUID(as_uuid=True), ForeignKey("land.land_id"), nullable=False)
    status = Column(String(50), ForeignKey("lu_status.status_key"), nullable=False, default='interested')
    comments = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    investor = relationship("User", back_populates="investor_interests")
    land = relationship("Land", back_populates="investor_interests")