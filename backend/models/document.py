from pydantic import BaseModel, ConfigDict
from typing import Optional
from enum import Enum


class DocumentType(str, Enum):
    RC_CERTIFICATE = "RC Certificate"
    INSURANCE_POLICY = "Insurance Policy"
    PUC_CERTIFICATE = "PUC Certificate"
    DRIVERS_LICENSE = "Driver's License"
    SERVICE_RECORDS = "Service Records"
    WARRANTY_DOCUMENTS = "Warranty Documents"
    OTHER = "Other"


# List of document types for master data
DOCUMENT_TYPES = [doc_type.value for doc_type in DocumentType]


class DocumentCreate(BaseModel):
    bike_id: str
    document_type: str
    custom_name: Optional[str] = None  # Used when document_type is "Other"


class DocumentResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    bike_id: str
    document_type: str
    custom_name: Optional[str] = None
    file_url: str
    public_id: str  # Cloudinary public_id for deletion
    file_name: str
    file_size: int  # Size in bytes
    created_at: str


class DocumentUpdate(BaseModel):
    document_type: Optional[str] = None
    custom_name: Optional[str] = None

