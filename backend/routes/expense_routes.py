from fastapi import APIRouter, Depends
from typing import List, Optional
from models import ExpenseCreate, ExpenseResponse, ExpenseUpdate, DashboardStats
from services import ExpenseService
from routes.dependencies import get_current_user

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.post("", response_model=ExpenseResponse)
async def create_expense(expense_data: ExpenseCreate, current_user: dict = Depends(get_current_user)):
    """Create a new expense"""
    return await ExpenseService.create_expense(expense_data, current_user["id"])


@router.get("", response_model=List[ExpenseResponse])
async def get_expenses(
    bike_id: Optional[str] = None,
    type: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all expenses with optional filters"""
    return await ExpenseService.get_expenses(current_user["id"], bike_id, type, search)


@router.get("/{expense_id}", response_model=ExpenseResponse)
async def get_expense(expense_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific expense by ID"""
    return await ExpenseService.get_expense_by_id(expense_id, current_user["id"])


@router.put("/{expense_id}", response_model=ExpenseResponse)
async def update_expense(expense_id: str, expense_data: ExpenseUpdate, current_user: dict = Depends(get_current_user)):
    """Update an expense"""
    return await ExpenseService.update_expense(expense_id, expense_data, current_user["id"])


@router.delete("/{expense_id}")
async def delete_expense(expense_id: str, current_user: dict = Depends(get_current_user)):
    """Delete an expense"""
    return await ExpenseService.delete_expense(expense_id, current_user["id"])
