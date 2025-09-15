from pydantic import BaseModel, EmailStr, Field, ConfigDict, validator, root_validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime, date
from uuid import UUID
from decimal import Decimal
import re
from enum import Enum

# Enums for better validation
class UserRoleEnum(str, Enum):
    ADMIN = "admin"
    LANDOWNER = "landowner"
    INVESTOR = "investor"
    REVIEWER = "reviewer"
    DEVELOPER = "developer"

class TaskPriorityEnum(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class TaskStatusEnum(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    ON_HOLD = "on_hold"

class LandStatusEnum(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    ARCHIVED = "archived"

class EnergyTypeEnum(str, Enum):
    SOLAR = "solar"
    WIND = "wind"
    HYDRO = "hydro"
    BIOMASS = "biomass"
    GEOTHERMAL = "geothermal"
    HYBRID = "hybrid"

class DocumentTypeEnum(str, Enum):
    LAND_DEED = "land_deed"
    SURVEY_REPORT = "survey_report"
    ENVIRONMENTAL_ASSESSMENT = "environmental_assessment"
    FEASIBILITY_STUDY = "feasibility_study"
    CONTRACT = "contract"
    PERMIT = "permit"
    OTHER = "other"

# Base configuration for all models
class BaseSchema(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        validate_assignment=True,
        str_strip_whitespace=True,
        use_enum_values=True
    )

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
    first_name: str = Field(..., min_length=1, max_length=50, description="User first name")
    last_name: str = Field(..., min_length=1, max_length=50, description="User last name")
    phone: Optional[str] = Field(None, description="User phone number")
    is_active: bool = Field(True, description="Whether user is active")

    @validator('phone')
    def validate_phone(cls, v):
        if v is not None:
            # Remove all non-digit characters
            digits_only = re.sub(r'\D', '', v)
            if len(digits_only) < 10 or len(digits_only) > 15:
                raise ValueError('Phone number must be between 10 and 15 digits')
        return v

    @validator('first_name', 'last_name')
    def validate_names(cls, v):
        if not v.replace(' ', '').replace('-', '').replace("'", '').isalpha():
            raise ValueError('Name must contain only letters, spaces, hyphens, and apostrophes')
        return v.title()

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128, description="User password")
    confirm_password: str = Field(..., description="Password confirmation")
    role: UserRoleEnum = Field(UserRoleEnum.LANDOWNER, description="User role")

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v

    @root_validator
    def validate_passwords_match(cls, values):
        password = values.get('password')
        confirm_password = values.get('confirm_password')
        if password and confirm_password and password != confirm_password:
            raise ValueError('Passwords do not match')
        return values

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
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=1, description="User password")
    remember_me: bool = Field(False, description="Remember login session")

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
    title: str = Field(..., min_length=1, max_length=200, description="Land title")
    location_text: Optional[str] = Field(None, max_length=500, description="Location description")
    coordinates: Optional[Dict[str, Any]] = Field(None, description="GPS coordinates as JSON")
    area_acres: Optional[Decimal] = Field(None, ge=0, le=100000, description="Land area in acres")
    land_type: Optional[str] = Field(None, max_length=100, description="Type of land/terrain")
    admin_notes: Optional[str] = Field(None, max_length=1000, description="Admin notes")
    energy_key: Optional[EnergyTypeEnum] = Field(None, description="Energy type")
    capacity_mw: Optional[Decimal] = Field(None, ge=0, le=10000, description="Planned capacity in MW")
    price_per_mwh: Optional[Decimal] = Field(None, ge=0, le=1000, description="Price per MWh")
    timeline_text: Optional[str] = Field(None, max_length=500, description="Implementation timeline")
    contract_term_years: Optional[int] = Field(None, ge=1, le=99, description="Contract term in years")
    developer_name: Optional[str] = Field(None, max_length=200, description="Developer/partner name")

    @validator('coordinates')
    def validate_coordinates(cls, v):
        if v is not None:
            if not isinstance(v, dict):
                raise ValueError('Coordinates must be a dictionary')
            if 'latitude' in v and 'longitude' in v:
                lat = float(v['latitude'])
                lng = float(v['longitude'])
                if not (-90 <= lat <= 90):
                    raise ValueError('Latitude must be between -90 and 90')
                if not (-180 <= lng <= 180):
                    raise ValueError('Longitude must be between -180 and 180')
        return v

    @validator('title')
    def validate_title(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty or whitespace only')
        return v.strip()

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
    document_type: Optional[DocumentTypeEnum] = Field(None, description="Type of document")
    file_name: str = Field(..., max_length=255, description="Original file name")
    file_path: str = Field(..., max_length=500, description="Storage file path")
    file_size: Optional[int] = Field(None, ge=0, le=104857600, description="File size in bytes (max 100MB)")
    mime_type: Optional[str] = Field(None, max_length=100, description="MIME type")
    is_draft: bool = Field(True, description="Whether document is in draft mode")

    @validator('file_name')
    def validate_file_name(cls, v):
        # Check for valid file name characters
        if not re.match(r'^[a-zA-Z0-9._-]+$', v):
            raise ValueError('File name contains invalid characters')
        return v

    @validator('mime_type')
    def validate_mime_type(cls, v):
        if v is not None:
            allowed_types = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'image/jpeg',
                'image/png',
                'image/gif',
                'text/plain'
            ]
            if v not in allowed_types:
                raise ValueError(f'MIME type {v} is not allowed')
        return v

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
    title: str = Field(..., min_length=1, max_length=200, description="Task title")
    description: Optional[str] = Field(None, max_length=1000, description="Task description")
    assigned_role: Optional[UserRoleEnum] = Field(None, description="Assigned role")
    assigned_to: Optional[UUID] = Field(None, description="Assigned user")
    priority: TaskPriorityEnum = Field(TaskPriorityEnum.MEDIUM, description="Task priority")
    start_date: Optional[date] = Field(None, description="Task start date")
    end_date: Optional[date] = Field(None, description="Task end date")

    @validator('end_date')
    def validate_end_date(cls, v, values):
        if v is not None and 'start_date' in values and values['start_date'] is not None:
            if v < values['start_date']:
                raise ValueError('End date must be after start date')
        return v

    @validator('title')
    def validate_title(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty or whitespace only')
        return v.strip()

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

class InterestLevelEnum(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"

class ContactPreferenceEnum(str, Enum):
    EMAIL = "email"
    PHONE = "phone"
    SMS = "sms"
    IN_PERSON = "in_person"

class InvestorListingBase(BaseSchema):
    company_name: Optional[str] = Field(None, max_length=200, description="Company name")
    investment_focus: Optional[str] = Field(None, max_length=500, description="Investment focus areas")
    min_investment: Optional[Decimal] = Field(None, ge=0, le=1000000000, description="Minimum investment amount")
    max_investment: Optional[Decimal] = Field(None, ge=0, le=1000000000, description="Maximum investment amount")
    preferred_regions: Optional[str] = Field(None, max_length=500, description="Preferred geographic regions")
    contact_info: Optional[str] = Field(None, max_length=500, description="Contact information")
    is_verified: bool = Field(False, description="Whether investor is verified")

    @validator('max_investment')
    def validate_investment_range(cls, v, values):
        if v is not None and 'min_investment' in values and values['min_investment'] is not None:
            if v < values['min_investment']:
                raise ValueError('Maximum investment must be greater than or equal to minimum investment')
        return v

    @validator('company_name')
    def validate_company_name(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Company name cannot be empty or whitespace only')
        return v.strip() if v else v

class InvestorInterestBase(BaseSchema):
    interest_level: InterestLevelEnum = Field(InterestLevelEnum.MEDIUM, description="Level of interest")
    investment_amount: Optional[Decimal] = Field(None, ge=0, le=1000000000, description="Proposed investment amount")
    comments: Optional[str] = Field(None, max_length=1000, description="Investor comments")
    contact_preference: Optional[ContactPreferenceEnum] = Field(None, description="Preferred contact method")

    @validator('investment_amount')
    def validate_investment_amount(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Investment amount must be greater than 0')
        return v

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

# Log Query Schemas
class LogQueryParams(BaseSchema):
    start: Optional[datetime] = Field(None, description="Start datetime for log filtering")
    end: Optional[datetime] = Field(None, description="End datetime for log filtering")
    level: Optional[str] = Field(None, regex="^(DEBUG|INFO|WARNING|ERROR|CRITICAL)$", description="Log level filter")
    source: Optional[str] = Field(None, max_length=100, description="Log source filter")
    message: Optional[str] = Field(None, max_length=500, description="Message content filter")
    limit: int = Field(100, ge=1, le=1000, description="Maximum number of logs to return")

    @validator('end')
    def validate_end_after_start(cls, v, values):
        if v is not None and 'start' in values and values['start'] is not None:
            if v <= values['start']:
                raise ValueError('End datetime must be after start datetime')
        return v

class LogEntry(BaseSchema):
    timestamp: datetime = Field(..., description="Log timestamp")
    level: str = Field(..., description="Log level")
    source: str = Field(..., description="Log source")
    message: str = Field(..., description="Log message")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional log metadata")

class LogQueryResponse(BaseSchema):
    logs: List[LogEntry] = Field(..., description="List of log entries")
    total_count: int = Field(..., ge=0, description="Total number of matching logs")
    query_params: LogQueryParams = Field(..., description="Query parameters used")
    execution_time_ms: float = Field(..., ge=0, description="Query execution time in milliseconds")

class LandResponse(Land):
    owner: Optional['User'] = None
    sections: Optional[List['LandSection']] = None
    documents: Optional[List['Document']] = None
    tasks: Optional[List['Task']] = None

class TaskResponse(Task):
    assigned_user: Optional['User'] = None
    history: Optional[List['TaskHistory']] = None

class TaskHistoryResponse(TaskHistory):
    changed_by_user: Optional['User'] = None

class InterestResponse(InvestorInterest):
    investor: Optional['User'] = None
    land: Optional['Land'] = None

class DocumentResponse(Document):
    uploaded_by_user: Optional['User'] = None

class LandVisibilityUpdate(BaseSchema):
    is_visible: bool = Field(..., description="Whether land should be visible to investors")

class MessageResponse(BaseSchema):
    message: str
    success: bool = True

class PaginationParams(BaseSchema):
    page: int = Field(1, ge=1, description="Page number")
    size: int = Field(10, ge=1, le=100, description="Items per page")
    sort_by: Optional[str] = Field(None, description="Field to sort by")
    sort_order: Optional[str] = Field("asc", description="Sort order")

    @validator('sort_order')
    def validate_sort_order(cls, v):
        if v not in ['asc', 'desc']:
            raise ValueError('Sort order must be either "asc" or "desc"')
        return v

class ErrorDetail(BaseSchema):
    field: Optional[str] = Field(None, description="Field that caused the error")
    message: str = Field(..., description="Error message")
    code: Optional[str] = Field(None, description="Error code")

class ErrorResponse(BaseSchema):
    detail: Union[str, List[ErrorDetail]] = Field(..., description="Error details")
    status_code: int = Field(..., description="HTTP status code")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Error timestamp")

class SuccessResponse(BaseSchema):
    message: str = Field(..., description="Success message")
    data: Optional[Dict[str, Any]] = Field(None, description="Additional data")

class PaginatedResponse(BaseSchema):
    items: List[Any] = Field(..., description="List of items")
    total: int = Field(..., ge=0, description="Total number of items")
    page: int = Field(..., ge=1, description="Current page number")
    size: int = Field(..., ge=1, description="Items per page")
    pages: int = Field(..., ge=0, description="Total number of pages")

# Forward references
LandWithSections.model_rebuild()