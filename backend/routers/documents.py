from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.lands import Document, Land
from models.users import User, UserRole
from routers.auth import get_current_user
from pydantic import BaseModel
from datetime import datetime
import os
import uuid
import shutil
from pathlib import Path

router = APIRouter()

# Configuration
UPLOAD_DIR = "uploads/documents"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".tiff"}

# Ensure upload directory exists
Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

# Pydantic models
class DocumentResponse(BaseModel):
    document_id: str
    land_id: str
    document_type: str
    file_name: str
    file_path: str
    file_size: Optional[int]
    uploaded_by: str
    uploaded_at: datetime
    
    # Additional fields
    uploader_name: Optional[str] = None
    land_title: Optional[str] = None
    
    class Config:
        from_attributes = True

class DocumentUpdate(BaseModel):
    document_type: Optional[str] = None
    file_name: Optional[str] = None

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

def can_access_documents(db: Session, user_id: str, land_id: str) -> bool:
    # Admin can access all documents
    if is_admin(db, user_id):
        return True
    
    # Landowner can access their land documents
    if is_landowner(db, user_id, land_id):
        return True
    
    # Check if land is published (public access)
    land = db.query(Land).filter(Land.land_id == land_id).first()
    if land and land.status == 'published':
        return True
    
    return False

def validate_file(file: UploadFile) -> tuple[bool, str]:
    """Validate uploaded file"""
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        return False, f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
    
    # Check file size (this is approximate, actual size check happens during upload)
    if hasattr(file, 'size') and file.size > MAX_FILE_SIZE:
        return False, f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
    
    return True, "Valid"

def save_uploaded_file(file: UploadFile, land_id: str) -> tuple[str, int]:
    """Save uploaded file and return file path and size"""
    # Generate unique filename
    file_ext = Path(file.filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    
    # Create land-specific directory
    land_dir = Path(UPLOAD_DIR) / land_id
    land_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = land_dir / unique_filename
    
    # Save file
    file_size = 0
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        file_size = file_path.stat().st_size
    
    # Check file size after saving
    if file_size > MAX_FILE_SIZE:
        file_path.unlink()  # Delete the file
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    return str(file_path), file_size

# API endpoints
@router.post("/upload/{land_id}", response_model=DocumentResponse)
async def upload_document(
    land_id: str,
    document_type: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a document for a land"""
    # Check if land exists
    land = db.query(Land).filter(Land.land_id == land_id).first()
    if not land:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Land not found"
        )
    
    # Check permissions - only admin or landowner can upload documents
    if not (is_admin(db, str(current_user.user_id)) or 
            is_landowner(db, str(current_user.user_id), land_id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to upload documents for this land"
        )
    
    # Validate file
    is_valid, message = validate_file(file)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    try:
        # Save file
        file_path, file_size = save_uploaded_file(file, land_id)
        
        # Create document record
        document = Document(
            land_id=land_id,
            document_type=document_type,
            file_name=file.filename,
            file_path=file_path,
            file_size=file_size,
            uploaded_by=current_user.user_id
        )
        
        db.add(document)
        db.commit()
        db.refresh(document)
        
        return DocumentResponse(
            document_id=str(document.document_id),
            land_id=str(document.land_id),
            document_type=document.document_type,
            file_name=document.file_name,
            file_path=document.file_path,
            file_size=document.file_size,
            uploaded_by=str(document.uploaded_by),
            uploaded_at=document.uploaded_at,
            uploader_name=current_user.full_name,
            land_title=land.title
        )
    
    except Exception as e:
        # Clean up file if database operation fails
        if 'file_path' in locals():
            try:
                Path(file_path).unlink()
            except:
                pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload document: {str(e)}"
        )

@router.get("/land/{land_id}", response_model=List[DocumentResponse])
async def get_land_documents(
    land_id: str,
    document_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get documents for a land"""
    # Check if land exists
    land = db.query(Land).filter(Land.land_id == land_id).first()
    if not land:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Land not found"
        )
    
    # Check permissions
    if not can_access_documents(db, str(current_user.user_id), land_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view documents for this land"
        )
    
    query = db.query(Document).filter(Document.land_id == land_id)
    
    if document_type:
        query = query.filter(Document.document_type == document_type)
    
    documents = query.order_by(Document.uploaded_at.desc()).all()
    
    result = []
    for doc in documents:
        # Get uploader details
        uploader = db.query(User).filter(User.user_id == doc.uploaded_by).first()
        
        result.append(DocumentResponse(
            document_id=str(doc.document_id),
            land_id=str(doc.land_id),
            document_type=doc.document_type,
            file_name=doc.file_name,
            file_path=doc.file_path,
            file_size=doc.file_size,
            uploaded_by=str(doc.uploaded_by),
            uploaded_at=doc.uploaded_at,
            uploader_name=uploader.full_name if uploader else None,
            land_title=land.title
        ))
    
    return result

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get document by ID"""
    document = db.query(Document).filter(Document.document_id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check permissions
    if not can_access_documents(db, str(current_user.user_id), str(document.land_id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view this document"
        )
    
    # Get additional details
    uploader = db.query(User).filter(User.user_id == document.uploaded_by).first()
    land = db.query(Land).filter(Land.land_id == document.land_id).first()
    
    return DocumentResponse(
        document_id=str(document.document_id),
        land_id=str(document.land_id),
        document_type=document.document_type,
        file_name=document.file_name,
        file_path=document.file_path,
        file_size=document.file_size,
        uploaded_by=str(document.uploaded_by),
        uploaded_at=document.uploaded_at,
        uploader_name=uploader.full_name if uploader else None,
        land_title=land.title if land else None
    )

@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: str,
    document_update: DocumentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update document metadata"""
    document = db.query(Document).filter(Document.document_id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check permissions - only admin or landowner can update
    if not (is_admin(db, str(current_user.user_id)) or 
            is_landowner(db, str(current_user.user_id), str(document.land_id))):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this document"
        )
    
    # Update document fields
    update_data = document_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(document, field, value)
    
    db.commit()
    db.refresh(document)
    
    # Get additional details
    uploader = db.query(User).filter(User.user_id == document.uploaded_by).first()
    land = db.query(Land).filter(Land.land_id == document.land_id).first()
    
    return DocumentResponse(
        document_id=str(document.document_id),
        land_id=str(document.land_id),
        document_type=document.document_type,
        file_name=document.file_name,
        file_path=document.file_path,
        file_size=document.file_size,
        uploaded_by=str(document.uploaded_by),
        uploaded_at=document.uploaded_at,
        uploader_name=uploader.full_name if uploader else None,
        land_title=land.title if land else None
    )

@router.delete("/{document_id}", response_model=dict)
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete document"""
    document = db.query(Document).filter(Document.document_id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check permissions - only admin or landowner can delete
    if not (is_admin(db, str(current_user.user_id)) or 
            is_landowner(db, str(current_user.user_id), str(document.land_id))):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this document"
        )
    
    # Delete physical file
    try:
        file_path = Path(document.file_path)
        if file_path.exists():
            file_path.unlink()
    except Exception as e:
        # Log error but don't fail the operation
        print(f"Warning: Could not delete file {document.file_path}: {e}")
    
    # Delete database record
    db.delete(document)
    db.commit()
    
    return {"message": "Document deleted successfully"}

@router.get("/download/{document_id}")
async def download_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download document file"""
    from fastapi.responses import FileResponse
    
    document = db.query(Document).filter(Document.document_id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check permissions
    if not can_access_documents(db, str(current_user.user_id), str(document.land_id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to download this document"
        )
    
    # Check if file exists
    file_path = Path(document.file_path)
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document file not found on server"
        )
    
    return FileResponse(
        path=str(file_path),
        filename=document.file_name,
        media_type='application/octet-stream'
    )

@router.get("/types/list", response_model=List[str])
async def get_document_types(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of available document types"""
    # Common document types for renewable energy projects
    document_types = [
        "land_title",
        "survey_report",
        "environmental_assessment",
        "zoning_permit",
        "building_permit",
        "utility_interconnection",
        "financial_statement",
        "insurance_certificate",
        "lease_agreement",
        "power_purchase_agreement",
        "engineering_study",
        "geotechnical_report",
        "archaeological_survey",
        "wildlife_assessment",
        "noise_study",
        "visual_impact_assessment",
        "transmission_study",
        "other"
    ]
    
    return document_types

@router.get("/my/uploads", response_model=List[DocumentResponse])
async def get_my_uploads(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get documents uploaded by current user"""
    documents = db.query(Document).filter(
        Document.uploaded_by == current_user.user_id
    ).order_by(Document.uploaded_at.desc()).all()
    
    result = []
    for doc in documents:
        # Get land details
        land = db.query(Land).filter(Land.land_id == doc.land_id).first()
        
        result.append(DocumentResponse(
            document_id=str(doc.document_id),
            land_id=str(doc.land_id),
            document_type=doc.document_type,
            file_name=doc.file_name,
            file_path=doc.file_path,
            file_size=doc.file_size,
            uploaded_by=str(doc.uploaded_by),
            uploaded_at=doc.uploaded_at,
            uploader_name=current_user.full_name,
            land_title=land.title if land else None
        ))
    
    return result