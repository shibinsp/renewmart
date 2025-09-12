from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.investors import InvestorInterest
from models.users import User, UserRole
from models.lands import Land
from routers.auth import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Pydantic models
class InterestCreate(BaseModel):
    land_id: str
    comments: Optional[str] = None

class InterestUpdate(BaseModel):
    status: Optional[str] = None
    comments: Optional[str] = None

class InterestResponse(BaseModel):
    interest_id: str
    investor_id: str
    land_id: str
    status: str
    comments: Optional[str]
    created_at: datetime
    
    # Additional fields for detailed view
    investor_name: Optional[str] = None
    investor_email: Optional[str] = None
    land_title: Optional[str] = None
    land_location: Optional[str] = None
    
    class Config:
        from_attributes = True

# Helper functions
def check_user_role(db: Session, user_id: str, required_roles: List[str]) -> bool:
    user_roles = db.query(UserRole).filter(UserRole.user_id == user_id).all()
    roles = [ur.role_key for ur in user_roles]
    return any(role in roles for role in required_roles)

def is_admin(db: Session, user_id: str) -> bool:
    return check_user_role(db, user_id, ["administrator"])

def is_landowner(db: Session, user_id: str, land_id: str) -> bool:
    land = db.query(Land).filter(Land.land_id == land_id).first()
    return land and str(land.landowner_id) == str(user_id)

def is_investor(db: Session, user_id: str) -> bool:
    return check_user_role(db, user_id, ["investor"])

# API endpoints
@router.post("/", response_model=InterestResponse)
async def express_interest(
    interest_data: InterestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Express interest in a land (investor only)"""
    # Check if user is an investor
    if not is_investor(db, str(current_user.user_id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only investors can express interest in lands"
        )
    
    # Check if land exists and is published
    land = db.query(Land).filter(Land.land_id == interest_data.land_id).first()
    if not land:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Land not found"
        )
    
    if land.status != 'published':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only express interest in published lands"
        )
    
    # Check if investor already expressed interest
    existing_interest = db.query(InvestorInterest).filter(
        InvestorInterest.investor_id == current_user.user_id,
        InvestorInterest.land_id == interest_data.land_id
    ).first()
    
    if existing_interest:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already expressed interest in this land"
        )
    
    # Create interest record
    interest = InvestorInterest(
        investor_id=current_user.user_id,
        land_id=interest_data.land_id,
        status="pending",
        comments=interest_data.comments
    )
    
    db.add(interest)
    db.commit()
    db.refresh(interest)
    
    return InterestResponse(
        interest_id=str(interest.interest_id),
        investor_id=str(interest.investor_id),
        land_id=str(interest.land_id),
        status=interest.status,
        comments=interest.comments,
        created_at=interest.created_at,
        investor_name=current_user.full_name,
        investor_email=current_user.email,
        land_title=land.title,
        land_location=land.location
    )

@router.get("/", response_model=List[InterestResponse])
async def get_interests(
    land_id: Optional[str] = None,
    investor_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get investor interests with filters"""
    query = db.query(InvestorInterest)
    
    # Apply access control
    if is_admin(db, str(current_user.user_id)):
        # Admin can see all interests
        pass
    elif land_id:
        # Check if user is landowner of specified land
        if not is_landowner(db, str(current_user.user_id), land_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to view interests for this land"
            )
    else:
        # Regular users can only see their own interests or interests in their lands
        user_lands = db.query(Land).filter(Land.landowner_id == current_user.user_id).all()
        land_ids = [str(land.land_id) for land in user_lands]
        
        query = query.filter(
            (InvestorInterest.investor_id == current_user.user_id) |
            (InvestorInterest.land_id.in_(land_ids))
        )
    
    # Apply filters
    if land_id:
        query = query.filter(InvestorInterest.land_id == land_id)
    
    if investor_id:
        # Only admin or the investor themselves can filter by investor_id
        if not (is_admin(db, str(current_user.user_id)) or str(current_user.user_id) == investor_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to filter by investor"
            )
        query = query.filter(InvestorInterest.investor_id == investor_id)
    
    if status:
        query = query.filter(InvestorInterest.status == status)
    
    interests = query.order_by(InvestorInterest.created_at.desc()).all()
    
    result = []
    for interest in interests:
        # Get additional details
        investor = db.query(User).filter(User.user_id == interest.investor_id).first()
        land = db.query(Land).filter(Land.land_id == interest.land_id).first()
        
        result.append(InterestResponse(
            interest_id=str(interest.interest_id),
            investor_id=str(interest.investor_id),
            land_id=str(interest.land_id),
            status=interest.status,
            comments=interest.comments,
            created_at=interest.created_at,
            investor_name=investor.full_name if investor else None,
            investor_email=investor.email if investor else None,
            land_title=land.title if land else None,
            land_location=land.location if land else None
        ))
    
    return result

@router.get("/{interest_id}", response_model=InterestResponse)
async def get_interest(
    interest_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get interest by ID"""
    interest = db.query(InvestorInterest).filter(
        InvestorInterest.interest_id == interest_id
    ).first()
    
    if not interest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interest not found"
        )
    
    # Check permissions
    if not (is_admin(db, str(current_user.user_id)) or 
            str(interest.investor_id) == str(current_user.user_id) or
            is_landowner(db, str(current_user.user_id), str(interest.land_id))):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view this interest"
        )
    
    # Get additional details
    investor = db.query(User).filter(User.user_id == interest.investor_id).first()
    land = db.query(Land).filter(Land.land_id == interest.land_id).first()
    
    return InterestResponse(
        interest_id=str(interest.interest_id),
        investor_id=str(interest.investor_id),
        land_id=str(interest.land_id),
        status=interest.status,
        comments=interest.comments,
        created_at=interest.created_at,
        investor_name=investor.full_name if investor else None,
        investor_email=investor.email if investor else None,
        land_title=land.title if land else None,
        land_location=land.location if land else None
    )

@router.put("/{interest_id}", response_model=InterestResponse)
async def update_interest(
    interest_id: str,
    interest_update: InterestUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update interest status or comments"""
    interest = db.query(InvestorInterest).filter(
        InvestorInterest.interest_id == interest_id
    ).first()
    
    if not interest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interest not found"
        )
    
    # Check permissions
    can_update_status = (
        is_admin(db, str(current_user.user_id)) or
        is_landowner(db, str(current_user.user_id), str(interest.land_id))
    )
    
    can_update_comments = (
        can_update_status or
        str(interest.investor_id) == str(current_user.user_id)
    )
    
    if not (can_update_status or can_update_comments):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this interest"
        )
    
    # Update fields based on permissions
    update_data = interest_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == 'status' and not can_update_status:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to update interest status"
            )
        
        if field == 'status' and value not in ['pending', 'accepted', 'rejected', 'withdrawn']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status. Must be one of: pending, accepted, rejected, withdrawn"
            )
        
        setattr(interest, field, value)
    
    db.commit()
    db.refresh(interest)
    
    # Get additional details
    investor = db.query(User).filter(User.user_id == interest.investor_id).first()
    land = db.query(Land).filter(Land.land_id == interest.land_id).first()
    
    return InterestResponse(
        interest_id=str(interest.interest_id),
        investor_id=str(interest.investor_id),
        land_id=str(interest.land_id),
        status=interest.status,
        comments=interest.comments,
        created_at=interest.created_at,
        investor_name=investor.full_name if investor else None,
        investor_email=investor.email if investor else None,
        land_title=land.title if land else None,
        land_location=land.location if land else None
    )

@router.delete("/{interest_id}", response_model=dict)
async def withdraw_interest(
    interest_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Withdraw interest (investor only) or delete interest (admin/landowner)"""
    interest = db.query(InvestorInterest).filter(
        InvestorInterest.interest_id == interest_id
    ).first()
    
    if not interest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interest not found"
        )
    
    # Check permissions
    is_investor_owner = str(interest.investor_id) == str(current_user.user_id)
    is_land_owner = is_landowner(db, str(current_user.user_id), str(interest.land_id))
    is_admin_user = is_admin(db, str(current_user.user_id))
    
    if not (is_investor_owner or is_land_owner or is_admin_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to withdraw/delete this interest"
        )
    
    if is_investor_owner and not (is_land_owner or is_admin_user):
        # Investor can only withdraw (change status), not delete
        interest.status = "withdrawn"
        db.commit()
        return {"message": "Interest withdrawn successfully"}
    else:
        # Admin or landowner can delete
        db.delete(interest)
        db.commit()
        return {"message": "Interest deleted successfully"}

@router.get("/my/interests", response_model=List[InterestResponse])
async def get_my_interests(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's interests"""
    query = db.query(InvestorInterest).filter(
        InvestorInterest.investor_id == current_user.user_id
    )
    
    if status:
        query = query.filter(InvestorInterest.status == status)
    
    interests = query.order_by(InvestorInterest.created_at.desc()).all()
    
    result = []
    for interest in interests:
        # Get land details
        land = db.query(Land).filter(Land.land_id == interest.land_id).first()
        
        result.append(InterestResponse(
            interest_id=str(interest.interest_id),
            investor_id=str(interest.investor_id),
            land_id=str(interest.land_id),
            status=interest.status,
            comments=interest.comments,
            created_at=interest.created_at,
            investor_name=current_user.full_name,
            investor_email=current_user.email,
            land_title=land.title if land else None,
            land_location=land.location if land else None
        ))
    
    return result

@router.get("/land/{land_id}/interests", response_model=List[InterestResponse])
async def get_land_interests(
    land_id: str,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get interests for a specific land (landowner/admin only)"""
    # Check if land exists
    land = db.query(Land).filter(Land.land_id == land_id).first()
    if not land:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Land not found"
        )
    
    # Check permissions
    if not (is_admin(db, str(current_user.user_id)) or 
            is_landowner(db, str(current_user.user_id), land_id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view interests for this land"
        )
    
    query = db.query(InvestorInterest).filter(InvestorInterest.land_id == land_id)
    
    if status:
        query = query.filter(InvestorInterest.status == status)
    
    interests = query.order_by(InvestorInterest.created_at.desc()).all()
    
    result = []
    for interest in interests:
        # Get investor details
        investor = db.query(User).filter(User.user_id == interest.investor_id).first()
        
        result.append(InterestResponse(
            interest_id=str(interest.interest_id),
            investor_id=str(interest.investor_id),
            land_id=str(interest.land_id),
            status=interest.status,
            comments=interest.comments,
            created_at=interest.created_at,
            investor_name=investor.full_name if investor else None,
            investor_email=investor.email if investor else None,
            land_title=land.title,
            land_location=land.location
        ))
    
    return result