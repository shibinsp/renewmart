from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from decimal import Decimal
from database import get_db
from models.lands import Land, LandSection
from models.users import User, UserRole
from models.lookup_tables import SectionDefinition
from routers.auth import get_current_user
from pydantic import BaseModel
import uuid

router = APIRouter()

# Pydantic models
class LandCreate(BaseModel):
    title: str
    location_text: Optional[str] = None
    coordinates: Optional[dict] = None
    area_acres: Optional[Decimal] = None
    land_type: Optional[str] = None

class LandUpdate(BaseModel):
    title: Optional[str] = None
    location_text: Optional[str] = None
    coordinates: Optional[dict] = None
    area_acres: Optional[Decimal] = None
    land_type: Optional[str] = None
    admin_notes: Optional[str] = None
    energy_key: Optional[str] = None
    capacity_mw: Optional[Decimal] = None
    price_per_mwh: Optional[Decimal] = None
    timeline_text: Optional[str] = None
    contract_term_years: Optional[int] = None
    developer_name: Optional[str] = None

class LandResponse(BaseModel):
    land_id: str
    landowner_id: str
    title: str
    location_text: Optional[str]
    coordinates: Optional[dict]
    area_acres: Optional[Decimal]
    land_type: Optional[str]
    status: str
    admin_notes: Optional[str]
    energy_key: Optional[str]
    capacity_mw: Optional[Decimal]
    price_per_mwh: Optional[Decimal]
    timeline_text: Optional[str]
    contract_term_years: Optional[int]
    developer_name: Optional[str]
    published_at: Optional[str]
    interest_locked_at: Optional[str]
    created_at: str
    updated_at: str
    
    class Config:
        from_attributes = True

class InvestorListingResponse(BaseModel):
    land_id: str
    title: str
    location_text: Optional[str]
    capacity_mw: Optional[Decimal]
    price_per_mwh: Optional[Decimal]
    timeline_text: Optional[str]
    contract_term_years: Optional[int]
    developer_name: Optional[str]
    energy_key: Optional[str]
    
    class Config:
        from_attributes = True

class ProjectDefinition(BaseModel):
    energy_key: str
    capacity_mw: Decimal
    price_per_mwh: Decimal
    timeline_text: str
    contract_term_years: int
    developer_name: str

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

# API endpoints
@router.post("/", response_model=LandResponse)
async def create_land(
    land_data: LandCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new land draft (landowner only)"""
    # Check if user has landowner role
    if not check_user_role(db, str(current_user.user_id), ["landowner"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only landowners can create land listings"
        )
    
    # Create new land
    new_land = Land(
        landowner_id=current_user.user_id,
        title=land_data.title,
        location_text=land_data.location_text,
        coordinates=land_data.coordinates,
        area_acres=land_data.area_acres,
        land_type=land_data.land_type,
        status='draft'
    )
    
    db.add(new_land)
    db.commit()
    db.refresh(new_land)
    
    # Bootstrap sections with default routing
    section_definitions = db.query(SectionDefinition).all()
    for section_def in section_definitions:
        land_section = LandSection(
            land_id=new_land.land_id,
            section_key=section_def.section_key,
            assigned_role=section_def.default_role_reviewer,
            status='draft',
            data={}
        )
        db.add(land_section)
    
    db.commit()
    
    return LandResponse(
        land_id=str(new_land.land_id),
        landowner_id=str(new_land.landowner_id),
        title=new_land.title,
        location_text=new_land.location_text,
        coordinates=new_land.coordinates,
        area_acres=new_land.area_acres,
        land_type=new_land.land_type,
        status=new_land.status,
        admin_notes=new_land.admin_notes,
        energy_key=new_land.energy_key,
        capacity_mw=new_land.capacity_mw,
        price_per_mwh=new_land.price_per_mwh,
        timeline_text=new_land.timeline_text,
        contract_term_years=new_land.contract_term_years,
        developer_name=new_land.developer_name,
        published_at=new_land.published_at.isoformat() if new_land.published_at else None,
        interest_locked_at=new_land.interest_locked_at.isoformat() if new_land.interest_locked_at else None,
        created_at=new_land.created_at.isoformat(),
        updated_at=new_land.updated_at.isoformat()
    )

@router.get("/", response_model=List[LandResponse])
async def get_lands(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get lands based on user role"""
    query = db.query(Land)
    
    # Filter based on user role
    user_roles = db.query(UserRole).filter(UserRole.user_id == current_user.user_id).all()
    roles = [ur.role_key for ur in user_roles]
    
    if "administrator" not in roles:
        if "landowner" in roles:
            # Landowners see only their own lands
            query = query.filter(Land.landowner_id == current_user.user_id)
        else:
            # Other roles see only submitted/approved lands
            query = query.filter(Land.status.in_(['submitted', 'under_review', 'approved', 'investor_ready']))
    
    if status:
        query = query.filter(Land.status == status)
    
    lands = query.offset(skip).limit(limit).all()
    
    result = []
    for land in lands:
        result.append(LandResponse(
            land_id=str(land.land_id),
            landowner_id=str(land.landowner_id),
            title=land.title,
            location_text=land.location_text,
            coordinates=land.coordinates,
            area_acres=land.area_acres,
            land_type=land.land_type,
            status=land.status,
            admin_notes=land.admin_notes,
            energy_key=land.energy_key,
            capacity_mw=land.capacity_mw,
            price_per_mwh=land.price_per_mwh,
            timeline_text=land.timeline_text,
            contract_term_years=land.contract_term_years,
            developer_name=land.developer_name,
            published_at=land.published_at.isoformat() if land.published_at else None,
            interest_locked_at=land.interest_locked_at.isoformat() if land.interest_locked_at else None,
            created_at=land.created_at.isoformat(),
            updated_at=land.updated_at.isoformat()
        ))
    
    return result

@router.get("/published", response_model=List[InvestorListingResponse])
async def get_published_lands(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get published lands for investors"""
    # Check if user has investor role
    if not check_user_role(db, str(current_user.user_id), ["investor"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only investors can view published listings"
        )
    
    lands = db.query(Land).filter(Land.status == 'published').all()
    
    result = []
    for land in lands:
        result.append(InvestorListingResponse(
            land_id=str(land.land_id),
            title=land.title,
            location_text=land.location_text,
            capacity_mw=land.capacity_mw,
            price_per_mwh=land.price_per_mwh,
            timeline_text=land.timeline_text,
            contract_term_years=land.contract_term_years,
            developer_name=land.developer_name,
            energy_key=land.energy_key
        ))
    
    return result

@router.get("/{land_id}", response_model=LandResponse)
async def get_land(
    land_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get land by ID"""
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
    
    return LandResponse(
        land_id=str(land.land_id),
        landowner_id=str(land.landowner_id),
        title=land.title,
        location_text=land.location_text,
        coordinates=land.coordinates,
        area_acres=land.area_acres,
        land_type=land.land_type,
        status=land.status,
        admin_notes=land.admin_notes,
        energy_key=land.energy_key,
        capacity_mw=land.capacity_mw,
        price_per_mwh=land.price_per_mwh,
        timeline_text=land.timeline_text,
        contract_term_years=land.contract_term_years,
        developer_name=land.developer_name,
        published_at=land.published_at.isoformat() if land.published_at else None,
        interest_locked_at=land.interest_locked_at.isoformat() if land.interest_locked_at else None,
        created_at=land.created_at.isoformat(),
        updated_at=land.updated_at.isoformat()
    )

@router.put("/{land_id}", response_model=LandResponse)
async def update_land(
    land_id: str,
    land_update: LandUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update land information"""
    land = db.query(Land).filter(Land.land_id == land_id).first()
    if not land:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Land not found"
        )
    
    # Check permissions - landowner can edit draft, admin can edit all
    if not (is_admin(db, str(current_user.user_id)) or 
            (is_landowner(db, str(current_user.user_id), land_id) and land.status == 'draft')):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Update land fields
    update_data = land_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(land, field, value)
    
    db.commit()
    db.refresh(land)
    
    return LandResponse(
        land_id=str(land.land_id),
        landowner_id=str(land.landowner_id),
        title=land.title,
        location_text=land.location_text,
        coordinates=land.coordinates,
        area_acres=land.area_acres,
        land_type=land.land_type,
        status=land.status,
        admin_notes=land.admin_notes,
        energy_key=land.energy_key,
        capacity_mw=land.capacity_mw,
        price_per_mwh=land.price_per_mwh,
        timeline_text=land.timeline_text,
        contract_term_years=land.contract_term_years,
        developer_name=land.developer_name,
        published_at=land.published_at.isoformat() if land.published_at else None,
        interest_locked_at=land.interest_locked_at.isoformat() if land.interest_locked_at else None,
        created_at=land.created_at.isoformat(),
        updated_at=land.updated_at.isoformat()
    )

@router.post("/{land_id}/submit", response_model=dict)
async def submit_land_for_review(
    land_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit land for admin review (landowner only)"""
    land = db.query(Land).filter(Land.land_id == land_id).first()
    if not land:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Land not found"
        )
    
    # Check if user is the landowner
    if not is_landowner(db, str(current_user.user_id), land_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the landowner can submit for review"
        )
    
    if land.status != 'draft':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft lands can be submitted"
        )
    
    # Update land status
    land.status = 'submitted'
    
    # Mark sections as submitted if they have data
    sections = db.query(LandSection).filter(LandSection.land_id == land_id).all()
    for section in sections:
        if section.status == 'draft':
            section.status = 'submitted'
            section.submitted_at = db.execute('SELECT NOW()').scalar()
    
    db.commit()
    
    return {"message": "Land submitted for review successfully"}

@router.post("/{land_id}/define-project", response_model=dict)
async def define_project(
    land_id: str,
    project_data: ProjectDefinition,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Define project details (admin only)"""
    if not is_admin(db, str(current_user.user_id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can define project details"
        )
    
    land = db.query(Land).filter(Land.land_id == land_id).first()
    if not land:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Land not found"
        )
    
    # Update project details
    land.energy_key = project_data.energy_key
    land.capacity_mw = project_data.capacity_mw
    land.price_per_mwh = project_data.price_per_mwh
    land.timeline_text = project_data.timeline_text
    land.contract_term_years = project_data.contract_term_years
    land.developer_name = project_data.developer_name
    
    db.commit()
    
    return {"message": "Project details defined successfully"}

@router.post("/{land_id}/publish", response_model=dict)
async def publish_land(
    land_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Publish land to investors (admin only)"""
    if not is_admin(db, str(current_user.user_id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can publish lands"
        )
    
    land = db.query(Land).filter(Land.land_id == land_id).first()
    if not land:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Land not found"
        )
    
    if land.status not in ['approved', 'investor_ready']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Land must be approved before publishing"
        )
    
    # Check required fields
    required_fields = ['title', 'location_text', 'energy_key', 'capacity_mw', 
                      'price_per_mwh', 'timeline_text', 'contract_term_years', 'developer_name']
    
    for field in required_fields:
        if not getattr(land, field):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required field: {field}"
            )
    
    # Publish the land
    land.status = 'published'
    land.published_at = db.execute('SELECT NOW()').scalar()
    
    db.commit()
    
    return {"message": "Land published successfully"}

@router.post("/{land_id}/mark-rtb", response_model=dict)
async def mark_land_rtb(
    land_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark land as Ready to Build (admin only)"""
    if not is_admin(db, str(current_user.user_id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can mark land as RTB"
        )
    
    land = db.query(Land).filter(Land.land_id == land_id).first()
    if not land:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Land not found"
        )
    
    # Check if all sections are approved
    pending_sections = db.query(LandSection).filter(
        LandSection.land_id == land_id,
        LandSection.status != 'approved'
    ).count()
    
    if pending_sections > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All sections must be approved before RTB"
        )
    
    # Check if all tasks are completed
    from models.tasks import Task
    open_tasks = db.query(Task).filter(
        Task.land_id == land_id,
        ~Task.status.in_(['completed', 'rejected', 'on_hold'])
    ).count()
    
    if open_tasks > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All tasks must be completed before RTB"
        )
    
    # Mark as RTB
    land.status = 'rtb'
    db.commit()
    
    return {"message": "Land marked as Ready to Build successfully"}