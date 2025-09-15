from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid


class InvestorInterest(Base):
    """Investor interest model"""
    __tablename__ = "investor_interests"
    
    interest_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    land_id = Column(UUID(as_uuid=True), ForeignKey("lands.land_id", ondelete="CASCADE"), nullable=False)
    investor_id = Column(UUID(as_uuid=True), ForeignKey("user.user_id"), nullable=False)
    investment_amount = Column(Numeric(15, 2))
    message = Column(Text)
    status = Column(String, default='pending')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    land = relationship("Land", back_populates="investor_interests")
    investor = relationship("User", back_populates="investor_interests")