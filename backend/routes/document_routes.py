from fastapi import APIRouter, HTTPException, Depends
from typing import List
from pydantic import BaseModel

from models import DocumentResponse, DOCUMENT_TYPES
from services.document_service import document_service
from routes.dependencies import get_current_user

router = APIRouter(prefix="/documents", tags=["documents"])


class DocumentSaveRequest(BaseModel):
    bike_id: str
    document_type: str
    file_url: str  # Cloudinary URL (uploaded from frontend)
    public_id: str  # Cloudinary public_id
    file_name: str
    file_size: int
    custom_name: str | None = None


@router.post("", response_model=DocumentResponse)
async def save_document(
    request: DocumentSaveRequest,
    current_user: dict = Depends(get_current_user)
):
    """Save document metadata (file uploaded to Cloudinary from frontend)"""
    try:
        # Validate document type
        if request.document_type not in DOCUMENT_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid document type. Must be one of: {DOCUMENT_TYPES}"
            )
        
        # Validate file name
        if not request.file_name.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are allowed"
            )
        
        # Validate file URL
        if not request.file_url or not request.file_url.startswith('http'):
            raise HTTPException(
                status_code=400,
                detail="Invalid file URL"
            )
        
        document = await document_service.save_document(
            user_id=current_user["id"],
            bike_id=request.bike_id,
            document_type=request.document_type,
            file_url=request.file_url,
            public_id=request.public_id,
            file_name=request.file_name,
            file_size=request.file_size,
            custom_name=request.custom_name
        )
        
        return DocumentResponse(**document)
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save document: {str(e)}")


@router.get("/bike/{bike_id}", response_model=List[DocumentResponse])
async def get_bike_documents(
    bike_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all documents for a specific bike"""
    documents = await document_service.get_documents_by_bike(
        user_id=current_user["id"],
        bike_id=bike_id
    )
    return [DocumentResponse(**doc) for doc in documents]


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific document by ID"""
    document = await document_service.get_document_by_id(
        user_id=current_user["id"],
        document_id=document_id
    )
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return DocumentResponse(**document)


@router.get("/{document_id}/download")
async def get_download_url(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a download URL for a document"""
    download_url = await document_service.get_download_url(
        user_id=current_user["id"],
        document_id=document_id
    )
    
    if not download_url:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {"download_url": download_url}


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a document"""
    success = await document_service.delete_document(
        user_id=current_user["id"],
        document_id=document_id
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {"message": "Document deleted successfully"}


@router.get("/types/list")
async def get_document_types():
    """Get list of available document types"""
    return DOCUMENT_TYPES

