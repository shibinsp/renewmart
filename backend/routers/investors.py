from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from uuid import UUID
from datetime import datetime
import uuid

from database import get_db
from auth import get_current_user, require_admin
from models.schemas import (
    InterestCreate, InterestUpdate, InterestResponse,
    LandVisibilityUpdate, MessageResponse
)

router = APIRouter(prefix="/investors", tags=["investors"])

# Helper functions
def can_access_interest(user_roles: List[str], user_id: str, interest_data: dict) -> bool:
    """Check if user can access an interest record"""
    # Admin can access all interests
    if "administrator" in user_roles:
        return True
    
    # Investor can access their own interests
    if str(interest_data.get("investor_id")) == user_id:
        return True
    
    # Land owner can access interests for their land
    if str(interest_data.get("owner_id")) == user_id:
        return True
    
    return False

def can_manage_interest(user_roles: List[str], user_id: str, interest_data: dict) -> bool:
    """Check if user can manage (update/delete) an interest record"""
    # Admin can manage all interests
    if "administrator" in user_roles:
        return True
    
    # Investor can manage their own interests
    if str(interest_data.get("investor_id")) == user_id:
        return True
    
    # Land owner can update status of interests for their land
    if str(interest_data.get("owner_id")) == user_id:
        return True
    
    return False

# Interest management endpoints
@router.post("/interest", response_model=InterestResponse)
async def express_interest(
    interest_data: InterestCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Express interest in a land (investor only)."""
    user_roles = current_user.get("roles", [])
    
    # Check if user is an investor
    if "investor" not in user_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only investors can express interest in lands"
        )
    
    # Check if land exists and is published
    land_check = text("""
        SELECT owner_id, status_key, title, location, visibility
        FROM lands 
        WHERE land_id = :land_id
    """)
    
    land_result = db.execute(land_check, {"land_id": str(interest_data.land_id)}).fetchone()
    
    if not land_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Land not found"
        )
    
    # Check if land is visible to investors
    if land_result.visibility not in ["public", "investors_only"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This land is not available for investor interest"
        )
    
    # Check if land is in appropriate status
    if land_result.status_key not in ["published", "ready_to_buy"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only express interest in published or ready-to-buy lands"
        )
    
    # Check if investor already expressed interest
    existing_check = text("""
        SELECT interest_id FROM investor_interests 
        WHERE investor_id = :investor_id AND land_id = :land_id
    """)
    
    existing_result = db.execute(existing_check, {
        "investor_id": current_user["user_id"],
        "land_id": str(interest_data.land_id)
    }).fetchone()
    
    if existing_result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already expressed interest in this land"
        )
    
    try:
        # Create interest record
        interest_id = str(uuid.uuid4())
        
        create_query = text("""
            INSERT INTO investor_interests (
                interest_id, investor_id, land_id, status, comments, created_at
            ) VALUES (
                :interest_id, :investor_id, :land_id, 'pending', :comments, CURRENT_TIMESTAMP
            )
        """)
        
        db.execute(create_query, {
            "interest_id": interest_id,
            "investor_id": current_user["user_id"],
            "land_id": str(interest_data.land_id),
            "comments": interest_data.comments
        })
        
        db.commit()
        
        # Fetch the created interest
        return await get_interest(UUID(interest_id), current_user, db)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to express interest: {str(e)}"
        )

@router.get("/interests", response_model=List[InterestResponse])
async def get_interests(
    land_id: Optional[UUID] = None,
    investor_id: Optional[UUID] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get interests with optional filters."""
    user_roles = current_user.get("roles", [])
    
    # Build base query
    base_query = """
        SELECT ii.interest_id, ii.investor_id, ii.land_id, ii.status,
               ii.comments, ii.created_at, ii.updated_at,
               l.title as land_title, l.location as land_location, l.owner_id,
               u.first_name || ' ' || u.last_name as investor_name,
               u.email as investor_email
        FROM investor_interests ii
        JOIN lands l ON ii.land_id = l.land_id
        JOIN users u ON ii.investor_id = u.user_id
        WHERE 1=1
    """
    
    params = {"skip": skip, "limit": limit}
    
    # Add filters
    if land_id:
        base_query += " AND ii.land_id = :land_id"
        params["land_id"] = str(land_id)
    
    if investor_id:
        base_query += " AND ii.investor_id = :investor_id"
        params["investor_id"] = str(investor_id)
    
    if status:
        base_query += " AND ii.status = :status"
        params["status"] = status
    
    # Add permission filter for non-admin users
    if "administrator" not in user_roles:
        base_query += """
            AND (ii.investor_id = :user_id OR l.owner_id = :user_id)
        """
        params["user_id"] = current_user["user_id"]
    
    base_query += " ORDER BY ii.created_at DESC OFFSET :skip LIMIT :limit"
    
    results = db.execute(text(base_query), params).fetchall()
    
    return [
        InterestResponse(
            interest_id=row.interest_id,
            investor_id=row.investor_id,
            land_id=row.land_id,
            status=row.status,
            comments=row.comments,
            created_at=row.created_at,
            updated_at=row.updated_at,
            land_title=row.land_title,
            land_location=row.land_location,
            investor_name=row.investor_name,
            investor_email=row.investor_email
        )
        for row in results
    ]

@router.get("/interest/{interest_id}", response_model=InterestResponse)
async def get_interest(
    interest_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get interest by ID."""
    query = text("""
        SELECT ii.interest_id, ii.investor_id, ii.land_id, ii.status,
               ii.comments, ii.created_at, ii.updated_at,
               l.title as land_title, l.location as land_location, l.owner_id,
               u.first_name || ' ' || u.last_name as investor_name,
               u.email as investor_email
        FROM investor_interests ii
        JOIN lands l ON ii.land_id = l.land_id
        JOIN users u ON ii.investor_id = u.user_id
        WHERE ii.interest_id = :interest_id
    """)
    
    result = db.execute(query, {"interest_id": str(interest_id)}).fetchone()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interest not found"
        )
    
    # Check permissions
    user_roles = current_user.get("roles", [])
    interest_data = {
        "investor_id": result.investor_id,
        "owner_id": result.owner_id
    }
    
    if not can_access_interest(user_roles, current_user["user_id"], interest_data):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view this interest"
        )
    
    return InterestResponse(
        interest_id=result.interest_id,
        investor_id=result.investor_id,
        land_id=result.land_id,
        status=result.status,
        comments=result.comments,
        created_at=result.created_at,
        updated_at=result.updated_at,
        land_title=result.land_title,
        land_location=result.land_location,
        investor_name=result.investor_name,
        investor_email=result.investor_email
    )

@router.put("/interest/{interest_id}", response_model=InterestResponse)
async def update_interest(
    interest_id: UUID,
    interest_update: InterestUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update interest (investor or land owner only)."""
    # Check if interest exists and user has permission
    interest_check = text("""
        SELECT ii.investor_id, ii.status as current_status, l.owner_id
        FROM investor_interests ii
        JOIN lands l ON ii.land_id = l.land_id
        WHERE ii.interest_id = :interest_id
    """)
    
    interest_result = db.execute(interest_check, {"interest_id": str(interest_id)}).fetchone()
    
    if not interest_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interest not found"
        )
    
    user_roles = current_user.get("roles", [])
    interest_data = {
        "investor_id": interest_result.investor_id,
        "owner_id": interest_result.owner_id
    }
    
    if not can_manage_interest(user_roles, current_user["user_id"], interest_data):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this interest"
        )
    
    try:
        # Build dynamic update query
        update_fields = []
        params = {"interest_id": str(interest_id)}
        
        update_data = interest_update.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            if field in ["status", "comments"]:
                # Land owners can only update status, investors can update comments
                if (field == "status" and str(interest_result.owner_id) == current_user["user_id"]) or \
                   (field == "comments" and str(interest_result.investor_id) == current_user["user_id"]) or \
                   "administrator" in user_roles:
                    update_fields.append(f"{field} = :{field}")
                    params[field] = value
        
        if update_fields:
            update_query = text(f"""
                UPDATE investor_interests 
                SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
                WHERE interest_id = :interest_id
            """)
            
            db.execute(update_query, params)
            db.commit()
        
        return await get_interest(interest_id, current_user, db)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update interest: {str(e)}"
        )

@router.delete("/interest/{interest_id}", response_model=MessageResponse)
async def withdraw_interest(
    interest_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Withdraw interest (investor only)."""
    # Check if interest exists and user has permission
    interest_check = text("""
        SELECT investor_id FROM investor_interests 
        WHERE interest_id = :interest_id
    """)
    
    interest_result = db.execute(interest_check, {"interest_id": str(interest_id)}).fetchone()
    
    if not interest_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interest not found"
        )
    
    user_roles = current_user.get("roles", [])
    
    # Only the investor who expressed interest or admin can withdraw
    if (str(interest_result.investor_id) != current_user["user_id"] and 
        "administrator" not in user_roles):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to withdraw this interest"
        )
    
    try:
        # Delete interest
        delete_query = text("DELETE FROM investor_interests WHERE interest_id = :interest_id")
        db.execute(delete_query, {"interest_id": str(interest_id)})
        
        db.commit()
        
        return MessageResponse(message="Interest withdrawn successfully")
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to withdraw interest: {str(e)}"
        )

@router.get("/my/interests", response_model=List[InterestResponse])
async def get_my_interests(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get interests expressed by the current user."""
    user_roles = current_user.get("roles", [])
    
    # Check if user is an investor
    if "investor" not in user_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only investors can view their interests"
        )
    
    base_query = """
        SELECT ii.interest_id, ii.investor_id, ii.land_id, ii.status,
               ii.comments, ii.created_at, ii.updated_at,
               l.title as land_title, l.location as land_location, l.owner_id,
               u.first_name || ' ' || u.last_name as investor_name,
               u.email as investor_email
        FROM investor_interests ii
        JOIN lands l ON ii.land_id = l.land_id
        JOIN users u ON ii.investor_id = u.user_id
        WHERE ii.investor_id = :user_id
    """
    
    params = {"user_id": current_user["user_id"]}
    
    if status:
        base_query += " AND ii.status = :status"
        params["status"] = status
    
    base_query += " ORDER BY ii.created_at DESC"
    
    results = db.execute(text(base_query), params).fetchall()
    
    return [
        InterestResponse(
            interest_id=row.interest_id,
            investor_id=row.investor_id,
            land_id=row.land_id,
            status=row.status,
            comments=row.comments,
            created_at=row.created_at,
            updated_at=row.updated_at,
            land_title=row.land_title,
            land_location=row.land_location,
            investor_name=row.investor_name,
            investor_email=row.investor_email
        )
        for row in results
    ]

@router.get("/land/{land_id}/interests", response_model=List[InterestResponse])
async def get_land_interests(
    land_id: UUID,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get interests for a specific land (land owner or admin only)."""
    # Check if land exists and user has permission
    land_check = text("SELECT owner_id FROM lands WHERE land_id = :land_id")
    land_result = db.execute(land_check, {"land_id": str(land_id)}).fetchone()
    
    if not land_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Land not found"
        )
    
    user_roles = current_user.get("roles", [])
    
    # Only land owner or admin can view interests for a land
    if (str(land_result.owner_id) != current_user["user_id"] and 
        "administrator" not in user_roles):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view interests for this land"
        )
    
    base_query = """
        SELECT ii.interest_id, ii.investor_id, ii.land_id, ii.status,
               ii.comments, ii.created_at, ii.updated_at,
               l.title as land_title, l.location as land_location, l.owner_id,
               u.first_name || ' ' || u.last_name as investor_name,
               u.email as investor_email
        FROM investor_interests ii
        JOIN lands l ON ii.land_id = l.land_id
        JOIN users u ON ii.investor_id = u.user_id
        WHERE ii.land_id = :land_id
    """
    
    params = {"land_id": str(land_id)}
    
    if status:
        base_query += " AND ii.status = :status"
        params["status"] = status
    
    base_query += " ORDER BY ii.created_at DESC"
    
    results = db.execute(text(base_query), params).fetchall()
    
    return [
        InterestResponse(
            interest_id=row.interest_id,
            investor_id=row.investor_id,
            land_id=row.land_id,
            status=row.status,
            comments=row.comments,
            created_at=row.created_at,
            updated_at=row.updated_at,
            land_title=row.land_title,
            land_location=row.land_location,
            investor_name=row.investor_name,
            investor_email=row.investor_email
        )
        for row in results
    ]

# Land visibility management endpoints
@router.put("/land/{land_id}/visibility", response_model=MessageResponse)
async def update_land_visibility(
    land_id: UUID,
    visibility_update: LandVisibilityUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update land visibility settings (land owner or admin only)."""
    # Check if land exists and user has permission
    land_check = text("SELECT owner_id FROM lands WHERE land_id = :land_id")
    land_result = db.execute(land_check, {"land_id": str(land_id)}).fetchone()
    
    if not land_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Land not found"
        )
    
    user_roles = current_user.get("roles", [])
    
    # Only land owner or admin can update visibility
    if (str(land_result.owner_id) != current_user["user_id"] and 
        "administrator" not in user_roles):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update visibility for this land"
        )
    
    try:
        # Update land visibility
        update_query = text("""
            UPDATE lands 
            SET visibility = :visibility, updated_at = CURRENT_TIMESTAMP
            WHERE land_id = :land_id
        """)
        
        db.execute(update_query, {
            "land_id": str(land_id),
            "visibility": visibility_update.visibility
        })
        
        db.commit()
        
        return MessageResponse(message="Land visibility updated successfully")
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update land visibility: {str(e)}"
        )

@router.get("/lands/visible", response_model=List[dict])
async def get_visible_lands(
    visibility: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get lands visible to investors."""
    user_roles = current_user.get("roles", [])
    
    # Check if user is an investor
    if "investor" not in user_roles and "administrator" not in user_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only investors can view visible lands"
        )
    
    # Build base query for lands visible to investors
    base_query = """
        SELECT l.land_id, l.title, l.location, l.area, l.price_per_acre,
               l.total_price, l.description, l.status_key, l.visibility,
               l.created_at, l.updated_at,
               u.first_name || ' ' || u.last_name as owner_name,
               COUNT(ii.interest_id) as interest_count
        FROM lands l
        JOIN users u ON l.owner_id = u.user_id
        LEFT JOIN investor_interests ii ON l.land_id = ii.land_id
        WHERE l.visibility IN ('public', 'investors_only')
        AND l.status_key IN ('published', 'ready_to_buy')
    """
    
    params = {"skip": skip, "limit": limit}
    
    # Add filters
    if visibility:
        base_query += " AND l.visibility = :visibility"
        params["visibility"] = visibility
    
    if status:
        base_query += " AND l.status_key = :status"
        params["status"] = status
    
    base_query += """
        GROUP BY l.land_id, l.title, l.location, l.area, l.price_per_acre,
                 l.total_price, l.description, l.status_key, l.visibility,
                 l.created_at, l.updated_at, u.first_name, u.last_name
        ORDER BY l.created_at DESC 
        OFFSET :skip LIMIT :limit
    """
    
    results = db.execute(text(base_query), params).fetchall()
    
    return [
        {
            "land_id": row.land_id,
            "title": row.title,
            "location": row.location,
            "area": row.area,
            "price_per_acre": row.price_per_acre,
            "total_price": row.total_price,
            "description": row.description,
            "status": row.status_key,
            "visibility": row.visibility,
            "owner_name": row.owner_name,
            "interest_count": row.interest_count,
            "created_at": row.created_at,
            "updated_at": row.updated_at
        }
        for row in results
    ]

# Statistics and reporting endpoints
@router.get("/stats/interests")
async def get_interest_stats(
    land_id: Optional[UUID] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get interest statistics."""
    user_roles = current_user.get("roles", [])
    
    base_query = """
        SELECT 
            COUNT(*) as total_interests,
            COUNT(CASE WHEN ii.status = 'pending' THEN 1 END) as pending_interests,
            COUNT(CASE WHEN ii.status = 'approved' THEN 1 END) as approved_interests,
            COUNT(CASE WHEN ii.status = 'rejected' THEN 1 END) as rejected_interests,
            COUNT(DISTINCT ii.investor_id) as unique_investors,
            COUNT(DISTINCT ii.land_id) as lands_with_interest
        FROM investor_interests ii
        JOIN lands l ON ii.land_id = l.land_id
        WHERE 1=1
    """
    
    params = {}
    
    if land_id:
        base_query += " AND ii.land_id = :land_id"
        params["land_id"] = str(land_id)
    
    # Add permission filter for non-admin users
    if "administrator" not in user_roles:
        if "investor" in user_roles:
            base_query += " AND ii.investor_id = :user_id"
        else:
            base_query += " AND l.owner_id = :user_id"
        params["user_id"] = current_user["user_id"]
    
    result = db.execute(text(base_query), params).fetchone()
    
    return {
        "total_interests": result.total_interests,
        "pending_interests": result.pending_interests,
        "approved_interests": result.approved_interests,
        "rejected_interests": result.rejected_interests,
        "unique_investors": result.unique_investors,
        "lands_with_interest": result.lands_with_interest
    }

@router.get("/stats/visibility")
async def get_visibility_stats(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get land visibility statistics."""
    user_roles = current_user.get("roles", [])
    
    base_query = """
        SELECT 
            COUNT(*) as total_lands,
            COUNT(CASE WHEN visibility = 'public' THEN 1 END) as public_lands,
            COUNT(CASE WHEN visibility = 'investors_only' THEN 1 END) as investor_only_lands,
            COUNT(CASE WHEN visibility = 'private' THEN 1 END) as private_lands,
            COUNT(CASE WHEN status_key IN ('published', 'ready_to_buy') THEN 1 END) as available_lands
        FROM lands
        WHERE 1=1
    """
    
    params = {}
    
    # Add permission filter for non-admin users
    if "administrator" not in user_roles:
        base_query += " AND owner_id = :user_id"
        params["user_id"] = current_user["user_id"]
    
    result = db.execute(text(base_query), params).fetchone()
    
    return {
        "total_lands": result.total_lands,
        "public_lands": result.public_lands,
        "investor_only_lands": result.investor_only_lands,
        "private_lands": result.private_lands,
        "available_lands": result.available_lands
    }

# Admin endpoints
@router.get("/admin/interests", response_model=List[InterestResponse])
async def get_all_interests(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all interests (admin only)."""
    base_query = """
        SELECT ii.interest_id, ii.investor_id, ii.land_id, ii.status,
               ii.comments, ii.created_at, ii.updated_at,
               l.title as land_title, l.location as land_location, l.owner_id,
               u.first_name || ' ' || u.last_name as investor_name,
               u.email as investor_email
        FROM investor_interests ii
        JOIN lands l ON ii.land_id = l.land_id
        JOIN users u ON ii.investor_id = u.user_id
        WHERE 1=1
    """
    
    params = {"skip": skip, "limit": limit}
    
    if status:
        base_query += " AND ii.status = :status"
        params["status"] = status
    
    base_query += " ORDER BY ii.created_at DESC OFFSET :skip LIMIT :limit"
    
    results = db.execute(text(base_query), params).fetchall()
    
    return [
        InterestResponse(
            interest_id=row.interest_id,
            investor_id=row.investor_id,
            land_id=row.land_id,
            status=row.status,
            comments=row.comments,
            created_at=row.created_at,
            updated_at=row.updated_at,
            land_title=row.land_title,
            land_location=row.land_location,
            investor_name=row.investor_name,
            investor_email=row.investor_email
        )
        for row in results
    ]

@router.get("/status/list", response_model=List[str])
async def get_interest_statuses(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of all interest statuses."""
    # Return standard interest statuses
    return ["pending", "approved", "rejected", "under_review", "contacted"]

@router.get("/visibility/list", response_model=List[str])
async def get_visibility_options(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of all visibility options."""
    # Return standard visibility options
    return ["public", "investors_only", "private"]