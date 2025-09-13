from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from uuid import UUID
from pathlib import Path
import os
import uuid
import shutil
from datetime import datetime

from database import get_db
from auth import get_current_user, require_admin
from models.schemas import (
    DocumentCreate, DocumentUpdate, DocumentResponse,
    MessageResponse
)

router = APIRouter(prefix="/documents", tags=["documents"])

# Configuration
UPLOAD_DIR = "uploads/documents"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".tiff", ".txt"}

# Ensure upload directory exists
Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

# Helper functions
def validate_file(file: UploadFile) -> tuple[bool, str]:
    """Validate uploaded file"""
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        return False, f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
    
    return True, "Valid"

def save_uploaded_file(file: UploadFile, land_id: str) -> tuple[str, int]:
    """Save uploaded file and return file path and size"""
    # Generate unique filename
    file_ext = Path(file.filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    
    # Create land-specific directory
    land_dir = Path(UPLOAD_DIR) / str(land_id)
    land_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = land_dir / unique_filename
    
    # Save file
    file_size = 0
    with open(file_path, "wb") as buffer:
        while chunk := file.file.read(8192):
            file_size += len(chunk)
            if file_size > MAX_FILE_SIZE:
                # Clean up partial file
                os.unlink(file_path)
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
                )
            buffer.write(chunk)
    
    return str(file_path), file_size

# Document endpoints
@router.post("/upload/{land_id}", response_model=DocumentResponse)
async def upload_document(
    land_id: UUID,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a document for a land (owner or admin only)."""
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
            detail="Not enough permissions to upload documents for this land"
        )
    
    # Validate file
    is_valid, error_msg = validate_file(file)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    try:
        # Save file
        file_path, file_size = save_uploaded_file(file, str(land_id))
        
        # Create document record
        document_id = str(uuid.uuid4())
        insert_query = text("""
            INSERT INTO documents (
                document_id, land_id, document_type, file_name, 
                file_path, file_size, uploaded_by
            ) VALUES (
                :document_id, :land_id, :document_type, :file_name,
                :file_path, :file_size, :uploaded_by
            )
        """)
        
        db.execute(insert_query, {
            "document_id": document_id,
            "land_id": str(land_id),
            "document_type": document_type,
            "file_name": file.filename,
            "file_path": file_path,
            "file_size": file_size,
            "uploaded_by": current_user["user_id"]
        })
        
        db.commit()
        
        # Fetch the created document
        return await get_document(UUID(document_id), current_user, db)
        
    except Exception as e:
        # Clean up file if database operation fails
        if 'file_path' in locals() and os.path.exists(file_path):
            os.unlink(file_path)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload document: {str(e)}"
        )

@router.get("/land/{land_id}", response_model=List[DocumentResponse])
async def get_land_documents(
    land_id: UUID,
    document_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all documents for a land."""
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
    
    # Check permissions
    user_roles = current_user.get("roles", [])
    if ("administrator" not in user_roles and 
        str(land_result.owner_id) != current_user["user_id"] and
        land_result.status_key != "published"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view documents for this land"
        )
    
    # Build query with optional document type filter
    base_query = """
        SELECT d.document_id, d.land_id, d.document_type, d.file_name,
               d.file_path, d.file_size, d.uploaded_by, d.uploaded_at,
               u.first_name || ' ' || u.last_name as uploader_name,
               l.title as land_title
        FROM documents d
        JOIN users u ON d.uploaded_by = u.user_id
        JOIN lands l ON d.land_id = l.land_id
        WHERE d.land_id = :land_id
    """
    
    params = {"land_id": str(land_id)}
    
    if document_type:
        base_query += " AND d.document_type = :document_type"
        params["document_type"] = document_type
    
    base_query += " ORDER BY d.uploaded_at DESC"
    
    results = db.execute(text(base_query), params).fetchall()
    
    return [
        DocumentResponse(
            document_id=row.document_id,
            land_id=row.land_id,
            document_type=row.document_type,
            file_name=row.file_name,
            file_path=row.file_path,
            file_size=row.file_size,
            uploaded_by=row.uploaded_by,
            uploaded_at=row.uploaded_at,
            uploader_name=row.uploader_name,
            land_title=row.land_title
        )
        for row in results
    ]

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get document by ID."""
    query = text("""
        SELECT d.document_id, d.land_id, d.document_type, d.file_name,
               d.file_path, d.file_size, d.uploaded_by, d.uploaded_at,
               u.first_name || ' ' || u.last_name as uploader_name,
               l.title as land_title, l.owner_id, l.status_key
        FROM documents d
        JOIN users u ON d.uploaded_by = u.user_id
        JOIN lands l ON d.land_id = l.land_id
        WHERE d.document_id = :document_id
    """)
    
    result = db.execute(query, {"document_id": str(document_id)}).fetchone()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check permissions
    user_roles = current_user.get("roles", [])
    if ("administrator" not in user_roles and 
        str(result.owner_id) != current_user["user_id"] and
        result.status_key != "published"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view this document"
        )
    
    return DocumentResponse(
        document_id=result.document_id,
        land_id=result.land_id,
        document_type=result.document_type,
        file_name=result.file_name,
        file_path=result.file_path,
        file_size=result.file_size,
        uploaded_by=result.uploaded_by,
        uploaded_at=result.uploaded_at,
        uploader_name=result.uploader_name,
        land_title=result.land_title
    )

@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: UUID,
    document_update: DocumentUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update document metadata (uploader or admin only)."""
    # Check if document exists and user has permission
    doc_check = text("""
        SELECT d.uploaded_by, l.owner_id
        FROM documents d
        JOIN lands l ON d.land_id = l.land_id
        WHERE d.document_id = :document_id
    """)
    
    doc_result = db.execute(doc_check, {"document_id": str(document_id)}).fetchone()
    
    if not doc_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    user_roles = current_user.get("roles", [])
    if ("administrator" not in user_roles and 
        str(doc_result.uploaded_by) != current_user["user_id"] and
        str(doc_result.owner_id) != current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this document"
        )
    
    # Build dynamic update query
    update_fields = []
    params = {"document_id": str(document_id)}
    
    update_data = document_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field in ["document_type", "file_name"]:
            update_fields.append(f"{field} = :{field}")
            params[field] = value
    
    if update_fields:
        update_query = text(f"""
            UPDATE documents 
            SET {', '.join(update_fields)}
            WHERE document_id = :document_id
        """)
        
        db.execute(update_query, params)
        db.commit()
    
    return await get_document(document_id, current_user, db)

@router.delete("/{document_id}", response_model=MessageResponse)
async def delete_document(
    document_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete document (uploader or admin only)."""
    # Check if document exists and user has permission
    doc_check = text("""
        SELECT d.uploaded_by, d.file_path, l.owner_id
        FROM documents d
        JOIN lands l ON d.land_id = l.land_id
        WHERE d.document_id = :document_id
    """)
    
    doc_result = db.execute(doc_check, {"document_id": str(document_id)}).fetchone()
    
    if not doc_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    user_roles = current_user.get("roles", [])
    if ("administrator" not in user_roles and 
        str(doc_result.uploaded_by) != current_user["user_id"] and
        str(doc_result.owner_id) != current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this document"
        )
    
    try:
        # Delete database record
        delete_query = text("DELETE FROM documents WHERE document_id = :document_id")
        db.execute(delete_query, {"document_id": str(document_id)})
        db.commit()
        
        # Delete physical file
        if doc_result.file_path and os.path.exists(doc_result.file_path):
            os.unlink(doc_result.file_path)
        
        return MessageResponse(message="Document deleted successfully")
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete document: {str(e)}"
        )

@router.get("/download/{document_id}")
async def download_document(
    document_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download document file."""
    # Check if document exists and user has permission
    doc_check = text("""
        SELECT d.file_path, d.file_name, l.owner_id, l.status_key
        FROM documents d
        JOIN lands l ON d.land_id = l.land_id
        WHERE d.document_id = :document_id
    """)
    
    doc_result = db.execute(doc_check, {"document_id": str(document_id)}).fetchone()
    
    if not doc_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check permissions
    user_roles = current_user.get("roles", [])
    if ("administrator" not in user_roles and 
        str(doc_result.owner_id) != current_user["user_id"] and
        doc_result.status_key != "published"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to download this document"
        )
    
    # Check if file exists
    if not os.path.exists(doc_result.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document file not found on server"
        )
    
    return FileResponse(
        path=doc_result.file_path,
        filename=doc_result.file_name,
        media_type='application/octet-stream'
    )

@router.get("/types/list", response_model=List[str])
async def get_document_types(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of all document types in use."""
    query = text("""
        SELECT DISTINCT document_type 
        FROM documents 
        ORDER BY document_type
    """)
    
    results = db.execute(query).fetchall()
    
    return [row.document_type for row in results]

@router.get("/my/uploads", response_model=List[DocumentResponse])
async def get_my_uploads(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all documents uploaded by the current user."""
    query = text("""
        SELECT d.document_id, d.land_id, d.document_type, d.file_name,
               d.file_path, d.file_size, d.uploaded_by, d.uploaded_at,
               u.first_name || ' ' || u.last_name as uploader_name,
               l.title as land_title
        FROM documents d
        JOIN users u ON d.uploaded_by = u.user_id
        JOIN lands l ON d.land_id = l.land_id
        WHERE d.uploaded_by = :user_id
        ORDER BY d.uploaded_at DESC
    """)
    
    results = db.execute(query, {"user_id": current_user["user_id"]}).fetchall()
    
    return [
        DocumentResponse(
            document_id=row.document_id,
            land_id=row.land_id,
            document_type=row.document_type,
            file_name=row.file_name,
            file_path=row.file_path,
            file_size=row.file_size,
            uploaded_by=row.uploaded_by,
            uploaded_at=row.uploaded_at,
            uploader_name=row.uploader_name,
            land_title=row.land_title
        )
        for row in results
    ]

# Admin endpoints
@router.get("/admin/all", response_model=List[DocumentResponse])
async def get_all_documents(
    skip: int = 0,
    limit: int = 100,
    document_type: Optional[str] = None,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all documents (admin only)."""
    base_query = """
        SELECT d.document_id, d.land_id, d.document_type, d.file_name,
               d.file_path, d.file_size, d.uploaded_by, d.uploaded_at,
               u.first_name || ' ' || u.last_name as uploader_name,
               l.title as land_title
        FROM documents d
        JOIN users u ON d.uploaded_by = u.user_id
        JOIN lands l ON d.land_id = l.land_id
        WHERE 1=1
    """
    
    params = {"skip": skip, "limit": limit}
    
    if document_type:
        base_query += " AND d.document_type = :document_type"
        params["document_type"] = document_type
    
    base_query += " ORDER BY d.uploaded_at DESC OFFSET :skip LIMIT :limit"
    
    results = db.execute(text(base_query), params).fetchall()
    
    return [
        DocumentResponse(
            document_id=row.document_id,
            land_id=row.land_id,
            document_type=row.document_type,
            file_name=row.file_name,
            file_path=row.file_path,
            file_size=row.file_size,
            uploaded_by=row.uploaded_by,
            uploaded_at=row.uploaded_at,
            uploader_name=row.uploader_name,
            land_title=row.land_title
        )
        for row in results
    ]