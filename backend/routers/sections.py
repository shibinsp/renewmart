from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.schemas import LandSection, Land, User, UserRole
from auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

# Pydantic models
class SectionUpdate(BaseModel):
    data: Optional[dict] = None
    assigned_role: Optional[str] = None
    assigned_user: Optional[str] = None

class SectionResponse(BaseModel):
    land_section_id: str
    land_id: str
    section_key: str
    status: str
    assigned_role: Optional[str]
    assigned_user: Optional[str]
    data: Optional[dict]
    reviewer_comments: Optional[str]
    submitted_at: Optional[str]
    approved_at: Optional[str]
    rejected_at: Optional[str]
    created_at: str
    updated_at: str
    
    class Config:
        from_attributes = True

class SectionDecision(BaseModel):
    decision: str  # 'approved' or 'rejected'
    comments: Optional[str] = None

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

def can_edit_section(db: Session, user_id: str, section: LandSection) -> bool:
    # Admin can edit all
    if is_admin(db, user_id):
        return True
    
    # Landowner can edit draft sections of their own land
    if section.status == 'draft' and is_landowner(db, user_id, str(section.land_id)):
        return True
    
    # Assigned user can edit their assigned sections
    if section.assigned_user and str(section.assigned_user) == str(user_id):
        return True
    
    # User with assigned role can edit
    if section.assigned_role:
        return check_user_role(db, user_id, [section.assigned_role])
    
    return False

# API endpoints
@router.get("/land/{land_id}", response_model=List[SectionResponse])
async def get_land_sections(
    land_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all sections for a land"""
    # Check if land exists
    land = db.query(Land).filter(Land.land_id == land_id).first()
    if not land:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Land not found"
        )
    
    # Check permissions
    if not (is_admin(db, str(current_user.user_id)) or 
            is_landowner(db, str(current_user.user_id), land_id) or
            land.status in ['published', 'submitted', 'under_review', 'approved']):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    sections = db.query(LandSection).filter(LandSection.land_id == land_id).all()
    
    result = []
    for section in sections:
        result.append(SectionResponse(
            land_section_id=str(section.land_section_id),
            land_id=str(section.land_id),
            section_key=section.section_key,
            status=section.status,
            assigned_role=section.assigned_role,
            assigned_user=str(section.assigned_user) if section.assigned_user else None,
            data=section.data,
            reviewer_comments=section.reviewer_comments,
            submitted_at=section.submitted_at.isoformat() if section.submitted_at else None,
            approved_at=section.approved_at.isoformat() if section.approved_at else None,
            rejected_at=section.rejected_at.isoformat() if section.rejected_at else None,
            created_at=section.created_at.isoformat(),
            updated_at=section.updated_at.isoformat()
        ))
    
    return result

@router.get("/{section_id}", response_model=SectionResponse)
async def get_section(
    section_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get section by ID"""
    section = db.query(LandSection).filter(LandSection.land_section_id == section_id).first()
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    
    # Check permissions
    land = db.query(Land).filter(Land.land_id == section.land_id).first()
    if not (is_admin(db, str(current_user.user_id)) or 
            is_landowner(db, str(current_user.user_id), str(section.land_id)) or
            (section.assigned_user and str(section.assigned_user) == str(current_user.user_id)) or
            (section.assigned_role and check_user_role(db, str(current_user.user_id), [section.assigned_role])) or
            land.status in ['published']):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return SectionResponse(
        land_section_id=str(section.land_section_id),
        land_id=str(section.land_id),
        section_key=section.section_key,
        status=section.status,
        assigned_role=section.assigned_role,
        assigned_user=str(section.assigned_user) if section.assigned_user else None,
        data=section.data,
        reviewer_comments=section.reviewer_comments,
        submitted_at=section.submitted_at.isoformat() if section.submitted_at else None,
        approved_at=section.approved_at.isoformat() if section.approved_at else None,
        rejected_at=section.rejected_at.isoformat() if section.rejected_at else None,
        created_at=section.created_at.isoformat(),
        updated_at=section.updated_at.isoformat()
    )

@router.put("/{section_id}", response_model=SectionResponse)
async def update_section(
    section_id: str,
    section_update: SectionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update section data"""
    section = db.query(LandSection).filter(LandSection.land_section_id == section_id).first()
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    
    # Check permissions
    if not can_edit_section(db, str(current_user.user_id), section):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to edit this section"
        )
    
    # Update section fields
    update_data = section_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == 'assigned_user' and value:
            # Validate user exists
            user = db.query(User).filter(User.user_id == value).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Assigned user not found"
                )
        setattr(section, field, value)
    
    db.commit()
    db.refresh(section)
    
    return SectionResponse(
        land_section_id=str(section.land_section_id),
        land_id=str(section.land_id),
        section_key=section.section_key,
        status=section.status,
        assigned_role=section.assigned_role,
        assigned_user=str(section.assigned_user) if section.assigned_user else None,
        data=section.data,
        reviewer_comments=section.reviewer_comments,
        submitted_at=section.submitted_at.isoformat() if section.submitted_at else None,
        approved_at=section.approved_at.isoformat() if section.approved_at else None,
        rejected_at=section.rejected_at.isoformat() if section.rejected_at else None,
        created_at=section.created_at.isoformat(),
        updated_at=section.updated_at.isoformat()
    )

@router.post("/{section_id}/assign", response_model=dict)
async def assign_section(
    section_id: str,
    assignment: SectionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assign section to role/user (admin only)"""
    if not is_admin(db, str(current_user.user_id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can assign sections"
        )
    
    section = db.query(LandSection).filter(LandSection.land_section_id == section_id).first()
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    
    # Update assignment
    if assignment.assigned_role:
        section.assigned_role = assignment.assigned_role
    
    if assignment.assigned_user:
        # Validate user exists
        user = db.query(User).filter(User.user_id == assignment.assigned_user).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assigned user not found"
            )
        section.assigned_user = assignment.assigned_user
    
    db.commit()
    
    return {"message": "Section assigned successfully"}

@router.post("/{section_id}/decide", response_model=dict)
async def decide_section(
    section_id: str,
    decision: SectionDecision,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve or reject section (reviewer only)"""
    section = db.query(LandSection).filter(LandSection.land_section_id == section_id).first()
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    
    # Check if user can review this section
    can_review = (
        is_admin(db, str(current_user.user_id)) or
        (section.assigned_user and str(section.assigned_user) == str(current_user.user_id)) or
        (section.assigned_role and check_user_role(db, str(current_user.user_id), [section.assigned_role]))
    )
    
    if not can_review:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to review this section"
        )
    
    if decision.decision not in ['approved', 'rejected']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Decision must be 'approved' or 'rejected'"
        )
    
    # Update section status
    section.status = decision.decision
    section.reviewer_comments = decision.comments
    
    if decision.decision == 'approved':
        section.approved_at = db.execute('SELECT NOW()').scalar()
        section.rejected_at = None
    else:
        section.rejected_at = db.execute('SELECT NOW()').scalar()
        section.approved_at = None
    
    db.commit()
    
    # Check if all sections are approved to update land status
    land = db.query(Land).filter(Land.land_id == section.land_id).first()
    if land:
        pending_sections = db.query(LandSection).filter(
            LandSection.land_id == section.land_id,
            LandSection.status != 'approved'
        ).count()
        
        if pending_sections == 0:
            # All sections approved
            land.status = 'approved'
        else:
            # Some sections still pending
            if land.status in ['submitted', 'under_review', 'approved']:
                land.status = 'under_review'
        
        db.commit()
    
    return {"message": f"Section {decision.decision} successfully"}

@router.get("/assigned/me", response_model=List[SectionResponse])
async def get_my_assigned_sections(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get sections assigned to current user"""
    # Get user roles
    user_roles = db.query(UserRole).filter(UserRole.user_id == current_user.user_id).all()
    roles = [ur.role_key for ur in user_roles]
    
    # Query sections assigned to user or their roles
    query = db.query(LandSection).filter(
        (LandSection.assigned_user == current_user.user_id) |
        (LandSection.assigned_role.in_(roles))
    )
    
    sections = query.all()
    
    result = []
    for section in sections:
        result.append(SectionResponse(
            land_section_id=str(section.land_section_id),
            land_id=str(section.land_id),
            section_key=section.section_key,
            status=section.status,
            assigned_role=section.assigned_role,
            assigned_user=str(section.assigned_user) if section.assigned_user else None,
            data=section.data,
            reviewer_comments=section.reviewer_comments,
            submitted_at=section.submitted_at.isoformat() if section.submitted_at else None,
            approved_at=section.approved_at.isoformat() if section.approved_at else None,
            rejected_at=section.rejected_at.isoformat() if section.rejected_at else None,
            created_at=section.created_at.isoformat(),
            updated_at=section.updated_at.isoformat()
        ))
    
    return result