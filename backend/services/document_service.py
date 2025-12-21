from datetime import datetime
from bson import ObjectId
from typing import List, Optional
import logging

from config.database import db

logger = logging.getLogger(__name__)

# Max file size: 10MB
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB in bytes


class DocumentService:
    def __init__(self):
        self.collection = db.documents

    async def save_document(
        self,
        user_id: str,
        bike_id: str,
        document_type: str,
        file_url: str,
        public_id: str,
        file_name: str,
        file_size: int,
        custom_name: Optional[str] = None
    ) -> dict:
        """Save document metadata to DB (file already uploaded to Cloudinary from frontend)"""
        
        # Validate file size
        if file_size > MAX_FILE_SIZE:
            raise ValueError(f"File size exceeds maximum limit of 10MB. File size: {file_size / (1024 * 1024):.2f}MB")

        # Save document metadata to database
        document_data = {
            "user_id": user_id,
            "bike_id": bike_id,
            "document_type": document_type,
            "custom_name": custom_name if document_type == "Other" else None,
            "file_url": file_url,
            "public_id": public_id,
            "file_name": file_name,
            "file_size": file_size,
            "created_at": datetime.utcnow().isoformat()
        }

        result = await self.collection.insert_one(document_data)
        document_data["id"] = str(result.inserted_id)
        
        logger.info(f"Document saved: {document_data['id']} - {file_name}")
        return document_data

    async def get_documents_by_bike(self, user_id: str, bike_id: str) -> List[dict]:
        """Get all documents for a specific bike"""
        cursor = self.collection.find({
            "user_id": user_id,
            "bike_id": bike_id
        }).sort("created_at", -1)
        
        documents = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            documents.append(doc)
        
        return documents

    async def get_document_by_id(self, user_id: str, document_id: str) -> Optional[dict]:
        """Get a specific document by ID"""
        try:
            doc = await self.collection.find_one({
                "_id": ObjectId(document_id),
                "user_id": user_id
            })
            if doc:
                doc["id"] = str(doc.pop("_id"))
                return doc
            return None
        except Exception:
            return None

    async def delete_document(self, user_id: str, document_id: str) -> bool:
        """Delete a document from database (Cloudinary deletion handled by frontend if needed)"""
        # First get the document
        doc = await self.get_document_by_id(user_id, document_id)
        if not doc:
            return False

        # Delete from database
        result = await self.collection.delete_one({
            "_id": ObjectId(document_id),
            "user_id": user_id
        })

        if result.deleted_count > 0:
            logger.info(f"Document deleted: {document_id}")
            return True
        return False

    async def get_download_url(self, user_id: str, document_id: str) -> Optional[str]:
        """Get a download URL for a document"""
        doc = await self.get_document_by_id(user_id, document_id)
        if not doc:
            return None
        
        # For Cloudinary, the secure_url is already a downloadable link
        # We can add fl_attachment to force download
        file_url = doc["file_url"]
        
        # Add download flag to URL
        if "cloudinary.com" in file_url:
            # Insert fl_attachment before the file path
            parts = file_url.split("/upload/")
            if len(parts) == 2:
                return f"{parts[0]}/upload/fl_attachment/{parts[1]}"
        
        return file_url


document_service = DocumentService()
