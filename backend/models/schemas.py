from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from uuid import UUID
from decimal import Decimal

# Base configuration for all models
class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

# ============================================================================
# LOOKUP TABLE SCHEMAS
# ============================================================================

class LuRoleBase(BaseSchema):
    role_key: str = Field(..., description="Role key identifier")
    label: str = Field(..., description="Human readable role label")

class LuRoleCreate(LuRoleBase):
    pass

class LuRole(LuRoleBase):
    pass

class LuStatusBase(BaseSchema):
    status_key: str = Field(..., description="Status key identifier")
    scope: str = Field(..., description="Scope of the status (land, section, task, etc.)")

class LuStatusCreate(LuStatusBase):
    pass

class LuStatus(LuStatusBase):
    pass

class LuTaskStatusBase(BaseSchema):
    status_key: str = Field(..., description="Task status key")

class LuTaskStatusCreate(LuTaskStatusBase):
    pass

class LuTaskStatus(LuTaskStatusBase):
    pass

class LuEnergyTypeBase(BaseSchema):
    energy_key: str = Field(..., description="Energy type key")

class LuEnergyTypeCreate(LuEnergyTypeBase):
    pass

class LuEnergyType(LuEnergyTypeBase):
    pass

# ============================================================================
# USER SCHEMAS
# ============================================================================

class UserBase(BaseSchema):
    email: EmailStr = Field(..., description="User email address")
    first_name: str = Field(..., min_length=1, description="User first name")
    last_name: str = Field(..., min_length=1, description="User last name")
    phone: Optional[str] = Field(None, description="User phone number")
    is_active: bool = Field(True, description="Whether user is active")

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="User password")

class UserUpdate(BaseSchema):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None

class User(UserBase):
    user_id: UUID
    created_at: datetime
    updated_at: datetime

class UserLogin(BaseSchema):
    email: EmailStr
    password: str

class Token(BaseSchema):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseSchema):
    user_id: Optional[UUID] = None
    roles: List[str] = []

# ============================================================================
# USER ROLE SCHEMAS
# ============================================================================

class UserRoleBase(BaseSchema):
    user_id: UUID
    role_key: str

class UserRoleCreate(UserRoleBase):
    pass

class UserRole(UserRoleBase):
    assigned_at: datetime

# ============================================================================
# SECTION DEFINITION SCHEMAS
# ============================================================================

class SectionDefinitionBase(BaseSchema):
    section_key: str = Field(..., description="Section key identifier")
    label: str = Field(..., description="Section display label")
    default_role_reviewer: Optional[str] = Field(None, description="Default reviewer role")

class SectionDefinitionCreate(SectionDefinitionBase):
    pass

class SectionDefinition(SectionDefinitionBase):
    pass

# ============================================================================
# LAND SCHEMAS
# ============================================================================

class LandBase(BaseSchema):
    title: str = Field(..., min_length=1, description="Land title")
    location_text: Optional[str] = Field(None, description="Location description")
    coordinates: Optional[Dict[str, Any]] = Field(None, description="GPS coordinates as JSON")
    area_acres: Optional[Decimal] = Field(None, ge=0, description="Land area in acres")
    land_type: Optional[str] = Field(None, description="Type of land/terrain")
    admin_notes: Optional[str] = Field(None, description="Admin notes")
    energy_key: Optional[str] = Field(None, description="Energy type")
    capacity_mw: Optional[Decimal] = Field(None, ge=0, description="Planned capacity in MW")
    price_per_mwh: Optional[Decimal] = Field(None, ge=0, description="Price per MWh")
    timeline_text: Optional[str] = Field(None, description="Implementation timeline")
    contract_term_years: Optional[int] = Field(None, ge=1, description="Contract term in years")
    developer_name: Optional[str] = Field(None, description="Developer/partner name")

class LandCreate(LandBase):
    pass

class LandUpdate(BaseSchema):
    title: Optional[str] = None
    location_text: Optional[str] = None
    coordinates: Optional[Dict[str, Any]] = None
    area_acres: Optional[Decimal] = None
    land_type: Optional[str] = None
    admin_notes: Optional[str] = None
    energy_key: Optional[str] = None
    capacity_mw: Optional[Decimal] = None
    price_per_mwh: Optional[Decimal] = None
    timeline_text: Optional[str] = None
    contract_term_years: Optional[int] = None
    developer_name: Optional[str] = None

class Land(LandBase):
    land_id: UUID
    landowner_id: UUID
    status: str
    published_at: Optional[datetime] = None
    interest_locked_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

class LandWithSections(Land):
    sections: List['LandSection'] = []
    documents: List['Document'] = []

# ============================================================================
# LAND SECTION SCHEMAS
# ============================================================================

class LandSectionBase(BaseSchema):
    section_key: str = Field(..., description="Section type key")
    assigned_role: Optional[str] = Field(None, description="Assigned reviewer role")
    assigned_user: Optional[UUID] = Field(None, description="Assigned reviewer user")
    data: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Section form data")
    reviewer_comments: Optional[str] = Field(None, description="Reviewer comments")

class LandSectionCreate(LandSectionBase):
    land_id: UUID

class LandSectionUpdate(BaseSchema):
    assigned_role: Optional[str] = None
    assigned_user: Optional[UUID] = None
    data: Optional[Dict[str, Any]] = None
    reviewer_comments: Optional[str] = None

class LandSection(LandSectionBase):
    land_section_id: UUID
    land_id: UUID
    status: str
    submitted_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

# ============================================================================
# DOCUMENT SCHEMAS
# ============================================================================

class DocumentBase(BaseSchema):
    document_type: Optional[str] = Field(None, description="Type of document")
    file_name: str = Field(..., description="Original file name")
    file_path: str = Field(..., description="Storage file path")
    file_size: Optional[int] = Field(None, ge=0, description="File size in bytes")
    mime_type: Optional[str] = Field(None, description="MIME type")
    is_draft: bool = Field(True, description="Whether document is in draft mode")

class DocumentCreate(DocumentBase):
    land_id: Optional[UUID] = None
    land_section_id: Optional[UUID] = None

class DocumentUpdate(BaseSchema):
    document_type: Optional[str] = None
    is_draft: Optional[bool] = None

class Document(DocumentBase):
    document_id: UUID
    land_id: Optional[UUID] = None
    land_section_id: Optional[UUID] = None
    uploaded_by: Optional[UUID] = None
    created_at: datetime

# ============================================================================
# TASK SCHEMAS
# ============================================================================

class TaskBase(BaseSchema):
    title: str = Field(..., min_length=1, description="Task title")
    description: Optional[str] = Field(None, description="Task description")
    assigned_role: Optional[str] = Field(None, description="Assigned role")
    assigned_to: Optional[UUID] = Field(None, description="Assigned user")
    priority: str = Field("medium", description="Task priority")
    start_date: Optional[date] = Field(None, description="Task start date")
    end_date: Optional[date] = Field(None, description="Task end date")

class TaskCreate(TaskBase):
    land_id: UUID
    land_section_id: Optional[UUID] = None

class TaskUpdate(BaseSchema):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_role: Optional[str] = None
    assigned_to: Optional[UUID] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class Task(TaskBase):
    task_id: UUID
    land_id: UUID
    land_section_id: Optional[UUID] = None
    status: str
    created_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

# ============================================================================
# TASK HISTORY SCHEMAS
# ============================================================================

class TaskHistoryBase(BaseSchema):
    from_status: Optional[str] = Field(None, description="Previous status")
    to_status: Optional[str] = Field(None, description="New status")
    note: Optional[str] = Field(None, description="Change note")

class TaskHistoryCreate(TaskHistoryBase):
    task_id: UUID
    changed_by: Optional[UUID] = None

class TaskHistory(TaskHistoryBase):
    history_id: UUID
    task_id: UUID
    changed_by: Optional[UUID] = None
    start_ts: datetime
    end_ts: Optional[datetime] = None

# ============================================================================
# INVESTOR INTEREST SCHEMAS
# ============================================================================

class InvestorInterestBase(BaseSchema):
    comments: Optional[str] = Field(None, description="Investor comments")

class InvestorInterestCreate(InvestorInterestBase):
    land_id: UUID

class InvestorInterestUpdate(BaseSchema):
    status: Optional[str] = None
    comments: Optional[str] = None

# Aliases for router compatibility
InterestCreate = InvestorInterestCreate
InterestUpdate = InvestorInterestUpdate

class InvestorInterest(InvestorInterestBase):
    interest_id: UUID
    investor_id: UUID
    land_id: UUID
    status: str
    created_at: datetime

# ============================================================================
# INVESTOR LISTING VIEW SCHEMA
# ============================================================================

class InvestorListing(BaseSchema):
    land_id: UUID
    title: str
    location_text: Optional[str] = None
    capacity_mw: Optional[Decimal] = None
    price_per_mwh: Optional[Decimal] = None
    timeline_text: Optional[str] = None
    contract_term_years: Optional[int] = None
    developer_name: Optional[str] = None
    energy_key: Optional[str] = None

# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================

# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================

class LandResponse(Land):
    pass

class TaskResponse(Task):
    pass

class TaskHistoryResponse(TaskHistory):
    pass

class InterestResponse(InvestorInterest):
    pass

class DocumentResponse(Document):
    pass

class LandVisibilityUpdate(BaseSchema):
    is_visible: bool = Field(..., description="Whether land should be visible to investors")

class MessageResponse(BaseSchema):
    message: str
    success: bool = True

class PaginatedResponse(BaseSchema):
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int

# Forward references
LandWithSections.model_rebuild()