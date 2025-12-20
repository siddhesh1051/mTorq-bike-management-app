from datetime import datetime, timezone
from uuid import uuid4
from typing import List
from fastapi import HTTPException
from config.database import db
from models import BikeCreate, BikeUpdate


class BikeService:
    @staticmethod
    async def create_bike(bike_data: BikeCreate, user_id: str) -> dict:
        bike_id = str(uuid4())
        bike_doc = {
            "id": bike_id,
            "user_id": user_id,
            "brand": bike_data.brand,
            "model": bike_data.model,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Add registration only if provided
        if bike_data.registration:
            bike_doc["registration"] = bike_data.registration
        
        # Add image_url only if provided
        if bike_data.image_url:
            bike_doc["image_url"] = bike_data.image_url

        await db.bikes.insert_one(bike_doc)
        return bike_doc

    @staticmethod
    async def get_bikes(user_id: str) -> List[dict]:
        bikes = await db.bikes.find({"user_id": user_id}, {"_id": 0}).to_list(100)
        return bikes

    @staticmethod
    async def get_bike_by_id(bike_id: str, user_id: str) -> dict:
        bike = await db.bikes.find_one({"id": bike_id, "user_id": user_id}, {"_id": 0})
        if not bike:
            raise HTTPException(status_code=404, detail="Bike not found")
        return bike

    @staticmethod
    async def update_bike(bike_id: str, bike_data: BikeUpdate, user_id: str) -> dict:
        bike = await db.bikes.find_one({"id": bike_id, "user_id": user_id}, {"_id": 0})
        if not bike:
            raise HTTPException(status_code=404, detail="Bike not found")

        update_data = {}
        unset_data = {}
        
        for key, value in bike_data.model_dump().items():
            if value is not None:
                # Handle empty string for image_url (to remove image)
                if key == "image_url" and value == "":
                    unset_data[key] = ""
                else:
                    update_data[key] = value

        if update_data:
            await db.bikes.update_one({"id": bike_id}, {"$set": update_data})
            bike.update(update_data)
        
        if unset_data:
            await db.bikes.update_one({"id": bike_id}, {"$unset": unset_data})
            for key in unset_data:
                bike.pop(key, None)

        return bike

    @staticmethod
    async def delete_bike(bike_id: str, user_id: str) -> dict:
        result = await db.bikes.delete_one({"id": bike_id, "user_id": user_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Bike not found")

        await db.expenses.delete_many({"bike_id": bike_id})

        return {"message": "Bike deleted successfully"}
