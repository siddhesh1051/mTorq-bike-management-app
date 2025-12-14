from fastapi import APIRouter, Depends
from typing import List
from models import BikeCreate, BikeResponse, BikeUpdate
from services import BikeService
from routes.dependencies import get_current_user

router = APIRouter(prefix="/bikes", tags=["Bikes"])


@router.post("", response_model=BikeResponse)
async def create_bike(bike_data: BikeCreate, current_user: dict = Depends(get_current_user)):
    """Create a new bike"""
    return await BikeService.create_bike(bike_data, current_user["id"])


@router.get("", response_model=List[BikeResponse])
async def get_bikes(current_user: dict = Depends(get_current_user)):
    """Get all bikes for the current user"""
    return await BikeService.get_bikes(current_user["id"])


@router.get("/{bike_id}", response_model=BikeResponse)
async def get_bike(bike_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific bike by ID"""
    return await BikeService.get_bike_by_id(bike_id, current_user["id"])


@router.put("/{bike_id}", response_model=BikeResponse)
async def update_bike(bike_id: str, bike_data: BikeUpdate, current_user: dict = Depends(get_current_user)):
    """Update a bike"""
    return await BikeService.update_bike(bike_id, bike_data, current_user["id"])


@router.delete("/{bike_id}")
async def delete_bike(bike_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a bike and all associated expenses"""
    return await BikeService.delete_bike(bike_id, current_user["id"])
