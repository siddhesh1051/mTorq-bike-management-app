from fastapi import APIRouter, Depends
from typing import List, Dict
from models import DashboardStats, BikeBrand, BikeModel, ExpenseType, BIKE_BRANDS_MODELS
from services import ExpenseService
from routes.dependencies import get_current_user

router = APIRouter(tags=["Master Data"])


@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get dashboard statistics"""
    return await ExpenseService.get_dashboard_stats(current_user["id"])


@router.get("/master/brands", response_model=List[str])
async def get_bike_brands():
    """Get all available bike brands"""
    return [brand.value for brand in BikeBrand]


@router.get("/master/models", response_model=List[str])
async def get_bike_models():
    """Get all available bike models"""
    return [model.value for model in BikeModel]


@router.get("/master/brands-models", response_model=Dict[str, List[str]])
async def get_brands_with_models():
    """Get all brands with their associated models"""
    return {
        brand.value: [model.value for model in models]
        for brand, models in BIKE_BRANDS_MODELS.items()
    }


@router.get("/master/expense-types", response_model=List[str])
async def get_expense_types():
    """Get all available expense types"""
    return [expense_type.value for expense_type in ExpenseType]
