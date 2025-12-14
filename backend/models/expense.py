from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from enum import Enum


class ExpenseType(str, Enum):
    FUEL = "Fuel"
    SERVICE = "Service"
    INSURANCE = "Insurance"
    ACCESSORIES = "Accessories"
    SPARE_PARTS = "Spare Parts"
    TYRES = "Tyres"
    BATTERY = "Battery"
    TOLL = "Toll"
    PARKING = "Parking"
    WASHING = "Washing"
    OTHER = "Other"


class ExpenseCreate(BaseModel):
    bike_id: str
    type: ExpenseType
    amount: float
    date: str  # ISO format date
    odometer: Optional[int] = None
    notes: Optional[str] = None


class ExpenseResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    bike_id: str
    type: str
    amount: float
    date: str
    odometer: Optional[int] = None
    notes: Optional[str] = None
    created_at: str


class ExpenseUpdate(BaseModel):
    bike_id: Optional[str] = None
    type: Optional[ExpenseType] = None
    amount: Optional[float] = None
    date: Optional[str] = None
    odometer: Optional[int] = None
    notes: Optional[str] = None


class DashboardStats(BaseModel):
    model_config = ConfigDict(extra="ignore")
    total_expenses: float
    category_breakdown: dict
    recent_expenses: List[ExpenseResponse]
    total_bikes: int
