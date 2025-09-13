from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from uuid import UUID
from decimal import Decimal

from database import get_db
from auth import get_current_user, require_admin
from models.schemas import (
    LandCreate, LandUpdate, LandResponse,
    LandSectionCreate, LandSection,
    SectionDefinition, MessageResponse
)

router = APIRouter(prefix="/lands", tags=["lands"])

# Land CRUD operations
@router.post("/", response_model=LandResponse)
async def create_land(
    land_data: LandCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new land entry (authenticated users)."""
    # Use stored procedure to create draft land
    query = text("""
        SELECT sp_land_create_draft(
            :owner_id, :title, :description, :location, :total_area, 
            :price_per_sqft, :total_price, :coordinates
        ) as land_id
    """)
    
    result = db.execute(query, {
        "owner_id": current_user["user_id"],
        "title": land_data.title,
        "description": land_data.description,
        "location": land_data.location,
        "total_area": float(land_data.total_area),
        "price_per_sqft": float(land_data.price_per_sqft),
        "total_price": float(land_data.total_price),
        "coordinates": land_data.coordinates
    }).fetchone()
    
    db.commit()
    
    if not result or not result.land_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create land"
        )
    
    # Fetch the created land
    return await get_land(result.land_id, current_user, db)

@router.get("/", response_model=List[LandResponse])
async def list_lands(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    owner_id: Optional[UUID] = Query(None, description="Filter by owner"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List lands with optional filters."""
    # Build dynamic query based on user role and filters
    base_query = """
        SELECT l.land_id, l.owner_id, l.title, l.description, l.location,
               l.total_area, l.price_per_sqft, l.total_price, l.coordinates,
               l.status_key, l.is_visible_to_investors, l.created_at, l.updated_at,
               u.first_name || ' ' || u.last_name as owner_name,
               s.label as status_label
        FROM lands l
        JOIN users u ON l.owner_id = u.user_id
        JOIN lu_status s ON l.status_key = s.status_key
        WHERE 1=1
    """
    
    params = {"skip": skip, "limit": limit}
    
    # Apply filters based on user role
    user_roles = current_user.get("roles", [])
    if "administrator" not in user_roles:
        # Non-admin users can only see their own lands or published lands
        base_query += " AND (l.owner_id = :current_user_id OR l.status_key = 'published')"
        params["current_user_id"] = current_user["user_id"]
    
    if status_filter:
        base_query += " AND l.status_key = :status_filter"
        params["status_filter"] = status_filter
    
    if owner_id:
        base_query += " AND l.owner_id = :owner_id"
        params["owner_id"] = str(owner_id)
    
    base_query += " ORDER BY l.created_at DESC OFFSET :skip LIMIT :limit"
    
    results = db.execute(text(base_query), params).fetchall()
    
    return [
        LandResponse(
            land_id=row.land_id,
            owner_id=row.owner_id,
            title=row.title,
            description=row.description,
            location=row.location,
            total_area=Decimal(str(row.total_area)),
            price_per_sqft=Decimal(str(row.price_per_sqft)),
            total_price=Decimal(str(row.total_price)),
            coordinates=row.coordinates,
            status_key=row.status_key,
            status_label=row.status_label,
            is_visible_to_investors=row.is_visible_to_investors,
            owner_name=row.owner_name,
            created_at=row.created_at,
            updated_at=row.updated_at
        )
        for row in results
    ]

@router.get("/{land_id}", response_model=LandResponse)
async def get_land(
    land_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get land by ID."""
    query = text("""
        SELECT l.land_id, l.owner_id, l.title, l.description, l.location,
               l.total_area, l.price_per_sqft, l.total_price, l.coordinates,
               l.status_key, l.is_visible_to_investors, l.created_at, l.updated_at,
               u.first_name || ' ' || u.last_name as owner_name,
               s.label as status_label
        FROM lands l
        JOIN users u ON l.owner_id = u.user_id
        JOIN lu_status s ON l.status_key = s.status_key
        WHERE l.land_id = :land_id
    """)
    
    result = db.execute(query, {"land_id": str(land_id)}).fetchone()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Land not found"
        )
    
    # Check permissions
    user_roles = current_user.get("roles", [])
    if ("administrator" not in user_roles and 
        str(result.owner_id) != current_user["user_id"] and
        result.status_key != "published"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view this land"
        )
    
    return LandResponse(
        land_id=result.land_id,
        owner_id=result.owner_id,
        title=result.title,
        description=result.description,
        location=result.location,
        total_area=Decimal(str(result.total_area)),
        price_per_sqft=Decimal(str(result.price_per_sqft)),
        total_price=Decimal(str(result.total_price)),
        coordinates=result.coordinates,
        status_key=result.status_key,
        status_label=result.status_label,
        is_visible_to_investors=result.is_visible_to_investors,
        owner_name=result.owner_name,
        created_at=result.created_at,
        updated_at=result.updated_at
    )

@router.put("/{land_id}", response_model=LandResponse)
async def update_land(
    land_id: UUID,
    land_update: LandUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update land information (owner or admin only)."""
    # Check if land exists and user has permission
    land_check = text("""
        SELECT owner_id, status_key FROM lands WHERE land_id = :land_id
    """)
    
    land_result = db.execute(land_check, {"land_id": str(land_id)}).fetchone()
    
    if not land_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Land not found"
        )
    
    user_roles = current_user.get("roles", [])
    if ("administrator" not in user_roles and 
        str(land_result.owner_id) != current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this land"
        )
    
    # Build dynamic update query
    update_fields = []
    params = {"land_id": str(land_id)}
    
    update_data = land_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field in ["title", "description", "location", "coordinates"]:
            update_fields.append(f"{field} = :{field}")
            params[field] = value
        elif field in ["total_area", "price_per_sqft", "total_price"]:
            update_fields.append(f"{field} = :{field}")
            params[field] = float(value)
    
    if update_fields:
        update_query = text(f"""
            UPDATE lands 
            SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
            WHERE land_id = :land_id
        """)
        
        db.execute(update_query, params)
        db.commit()
    
    return await get_land(land_id, current_user, db)

@router.delete("/{land_id}", response_model=MessageResponse)
async def delete_land(
    land_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete land (owner or admin only)."""
    # Check if land exists and user has permission
    land_check = text("""
        SELECT owner_id, status_key FROM lands WHERE land_id = :land_id
    """)
    
    land_result = db.execute(land_check, {"land_id": str(land_id)}).fetchone()
    
    if not land_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Land not found"
        )
    
    user_roles = current_user.get("roles", [])
    if ("administrator" not in user_roles and 
        str(land_result.owner_id) != current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this land"
        )
    
    # Only allow deletion of draft lands
    if land_result.status_key != "draft":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft lands can be deleted"
        )
    
    delete_query = text("DELETE FROM lands WHERE land_id = :land_id")
    db.execute(delete_query, {"land_id": str(land_id)})
    db.commit()
    
    return MessageResponse(message="Land deleted successfully")

# Land status management
@router.post("/{land_id}/submit", response_model=MessageResponse)
async def submit_land_for_review(
    land_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit land for review (owner only)."""
    # Use stored procedure
    query = text("SELECT sp_land_submit_for_review(:land_id, :owner_id) as success")
    
    try:
        result = db.execute(query, {
            "land_id": str(land_id),
            "owner_id": current_user["user_id"]
        }).fetchone()
        
        db.commit()
        
        if result and result.success:
            return MessageResponse(message="Land submitted for review successfully")
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to submit land for review"
            )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error submitting land: {str(e)}"
        )

@router.post("/{land_id}/publish", response_model=MessageResponse)
async def publish_land(
    land_id: UUID,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Publish land (admin only)."""
    query = text("SELECT sp_publish_land(:land_id) as success")
    
    try:
        result = db.execute(query, {"land_id": str(land_id)}).fetchone()
        db.commit()
        
        if result and result.success:
            return MessageResponse(message="Land published successfully")
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to publish land"
            )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error publishing land: {str(e)}"
        )

@router.post("/{land_id}/mark-rtb", response_model=MessageResponse)
async def mark_land_ready_to_buy(
    land_id: UUID,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Mark land as ready to buy (admin only)."""
    query = text("SELECT sp_land_mark_rtb(:land_id) as success")
    
    try:
        result = db.execute(query, {"land_id": str(land_id)}).fetchone()
        db.commit()
        
        if result and result.success:
            return MessageResponse(message="Land marked as ready to buy successfully")
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to mark land as ready to buy"
            )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error marking land as RTB: {str(e)}"
        )

# Land sections management
@router.get("/{land_id}/sections", response_model=List[LandSection])
async def get_land_sections(
    land_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all sections for a land."""
    # First check if user can access this land
    await get_land(land_id, current_user, db)
    
    query = text("""
        SELECT ls.land_section_id, ls.land_id, ls.section_definition_id,
               ls.section_data, ls.created_at, ls.updated_at,
               sd.section_name, sd.section_type, sd.is_required
        FROM land_sections ls
        JOIN section_definitions sd ON ls.section_definition_id = sd.section_definition_id
        WHERE ls.land_id = :land_id
        ORDER BY sd.section_name
    """)
    
    results = db.execute(query, {"land_id": str(land_id)}).fetchall()
    
    return [
        LandSection(
            land_section_id=row.land_section_id,
            land_id=row.land_id,
            section_definition_id=row.section_definition_id,
            section_data=row.section_data,
            created_at=row.created_at,
            updated_at=row.updated_at
        )
        for row in results
    ]

@router.post("/{land_id}/sections", response_model=LandSection)
async def create_land_section(
    land_id: UUID,
    section_data: LandSectionCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new section for a land."""
    # Check if user owns the land or is admin
    land_check = text("SELECT owner_id FROM lands WHERE land_id = :land_id")
    land_result = db.execute(land_check, {"land_id": str(land_id)}).fetchone()
    
    if not land_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Land not found"
        )
    
    user_roles = current_user.get("roles", [])
    if ("administrator" not in user_roles and 
        str(land_result.owner_id) != current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Use stored procedure to assign section
    query = text("""
        SELECT sp_assign_section(:land_id, :section_definition_id, :section_data) as section_id
    """)
    
    result = db.execute(query, {
        "land_id": str(land_id),
        "section_definition_id": str(section_data.section_definition_id),
        "section_data": section_data.section_data
    }).fetchone()
    
    db.commit()
    
    if not result or not result.section_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create section"
        )
    
    # Fetch the created section
    section_query = text("""
        SELECT land_section_id, land_id, section_definition_id, section_data, created_at, updated_at
        FROM land_sections
        WHERE land_section_id = :section_id
    """)
    
    section_result = db.execute(section_query, {"section_id": result.section_id}).fetchone()
    
    return LandSection(
        land_section_id=section_result.land_section_id,
        land_id=section_result.land_id,
        section_definition_id=section_result.section_definition_id,
        section_data=section_result.section_data,
        created_at=section_result.created_at,
        updated_at=section_result.updated_at
    )

@router.get("/sections/definitions", response_model=List[SectionDefinition])
async def get_section_definitions(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all available section definitions."""
    query = text("""
        SELECT section_definition_id, section_name, section_type, is_required, created_at
        FROM section_definitions
        ORDER BY section_name
    """)
    
    results = db.execute(query).fetchall()
    
    return [
        SectionDefinition(
            section_definition_id=row.section_definition_id,
            section_name=row.section_name,
            section_type=row.section_type,
            is_required=row.is_required,
            created_at=row.created_at
        )
        for row in results
    ]