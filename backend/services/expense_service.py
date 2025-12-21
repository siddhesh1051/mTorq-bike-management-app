from datetime import datetime, timezone
from uuid import uuid4
from typing import List, Optional
from fastapi import HTTPException
from config.database import db
from models import ExpenseCreate, ExpenseUpdate


class ExpenseService:
    @staticmethod
    async def create_expense(expense_data: ExpenseCreate, user_id: str) -> dict:
        bike = await db.bikes.find_one({"id": expense_data.bike_id, "user_id": user_id}, {"_id": 0})
        if not bike:
            raise HTTPException(status_code=404, detail="Bike not found")

        expense_id = str(uuid4())
        expense_doc = {
            "id": expense_id,
            "user_id": user_id,
            "bike_id": expense_data.bike_id,
            "type": expense_data.type.value,
            "amount": expense_data.amount,
            "date": expense_data.date,
            "odometer": expense_data.odometer,
            "notes": expense_data.notes,
            # Fuel-specific fields
            "litres": expense_data.litres,
            "is_full_tank": expense_data.is_full_tank,
            "price_per_litre": expense_data.price_per_litre,
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        await db.expenses.insert_one(expense_doc)
        return expense_doc

    @staticmethod
    async def get_expenses(
        user_id: str,
        bike_id: Optional[str] = None,
        expense_type: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[dict]:
        query = {"user_id": user_id}

        if bike_id:
            query["bike_id"] = bike_id
        if expense_type:
            query["type"] = expense_type
        if search:
            query["notes"] = {"$regex": search, "$options": "i"}

        expenses = await db.expenses.find(query, {"_id": 0}).sort("date", -1).to_list(1000)
        return expenses

    @staticmethod
    async def get_expense_by_id(expense_id: str, user_id: str) -> dict:
        expense = await db.expenses.find_one({"id": expense_id, "user_id": user_id}, {"_id": 0})
        if not expense:
            raise HTTPException(status_code=404, detail="Expense not found")
        return expense

    @staticmethod
    async def update_expense(expense_id: str, expense_data: ExpenseUpdate, user_id: str) -> dict:
        expense = await db.expenses.find_one({"id": expense_id, "user_id": user_id}, {"_id": 0})
        if not expense:
            raise HTTPException(status_code=404, detail="Expense not found")

        update_data = {}
        for key, value in expense_data.model_dump().items():
            if value is not None:
                if key == 'type':
                    update_data[key] = value.value
                else:
                    update_data[key] = value

        if update_data:
            await db.expenses.update_one({"id": expense_id}, {"$set": update_data})
            expense.update(update_data)

        return expense

    @staticmethod
    async def delete_expense(expense_id: str, user_id: str) -> dict:
        result = await db.expenses.delete_one({"id": expense_id, "user_id": user_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Expense not found")

        return {"message": "Expense deleted successfully"}

    @staticmethod
    async def get_dashboard_stats(user_id: str) -> dict:
        expenses = await db.expenses.find({"user_id": user_id}, {"_id": 0}).to_list(10000)

        total_expenses = sum(exp["amount"] for exp in expenses)

        category_breakdown = {}
        for exp in expenses:
            exp_type = exp["type"]
            category_breakdown[exp_type] = category_breakdown.get(exp_type, 0) + exp["amount"]

        recent = sorted(expenses, key=lambda x: x["date"], reverse=True)[:5]

        bikes_count = await db.bikes.count_documents({"user_id": user_id})

        return {
            "total_expenses": total_expenses,
            "category_breakdown": category_breakdown,
            "recent_expenses": recent,
            "total_bikes": bikes_count
        }
