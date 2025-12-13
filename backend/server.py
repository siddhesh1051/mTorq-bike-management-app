from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ===== MODELS =====

# Auth Models
class UserSignup(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    email: str
    name: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Bike Models
class BikeCreate(BaseModel):
    name: str
    model: str
    registration: str

class BikeResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    name: str
    model: str
    registration: str
    created_at: str

class BikeUpdate(BaseModel):
    name: Optional[str] = None
    model: Optional[str] = None
    registration: Optional[str] = None

# Expense Models
class ExpenseCreate(BaseModel):
    bike_id: str
    type: str  # Fuel, Service, Insurance, Other
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
    type: Optional[str] = None
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

# ===== HELPER FUNCTIONS =====

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ===== AUTH ROUTES =====

@api_router.post("/auth/signup", response_model=TokenResponse)
async def signup(user_data: UserSignup):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    from uuid import uuid4
    user_id = str(uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "name": user_data.name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Create token
    token = create_access_token({"user_id": user_id})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "email": user_data.email,
            "name": user_data.name,
            "created_at": user_doc["created_at"]
        }
    }

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    # Find user
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create token
    token = create_access_token({"user_id": user["id"]})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "email": user["email"],
            "name": user["name"],
            "created_at": user["created_at"]
        }
    }

# ===== BIKE ROUTES =====

@api_router.post("/bikes", response_model=BikeResponse)
async def create_bike(bike_data: BikeCreate, current_user: dict = Depends(get_current_user)):
    from uuid import uuid4
    bike_id = str(uuid4())
    bike_doc = {
        "id": bike_id,
        "user_id": current_user["id"],
        "name": bike_data.name,
        "model": bike_data.model,
        "registration": bike_data.registration,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.bikes.insert_one(bike_doc)
    return bike_doc

@api_router.get("/bikes", response_model=List[BikeResponse])
async def get_bikes(current_user: dict = Depends(get_current_user)):
    bikes = await db.bikes.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(100)
    return bikes

@api_router.put("/bikes/{bike_id}", response_model=BikeResponse)
async def update_bike(bike_id: str, bike_data: BikeUpdate, current_user: dict = Depends(get_current_user)):
    bike = await db.bikes.find_one({"id": bike_id, "user_id": current_user["id"]}, {"_id": 0})
    if not bike:
        raise HTTPException(status_code=404, detail="Bike not found")
    
    update_data = {k: v for k, v in bike_data.model_dump().items() if v is not None}
    if update_data:
        await db.bikes.update_one({"id": bike_id}, {"$set": update_data})
        bike.update(update_data)
    
    return bike

@api_router.delete("/bikes/{bike_id}")
async def delete_bike(bike_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.bikes.delete_one({"id": bike_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bike not found")
    
    # Also delete all expenses for this bike
    await db.expenses.delete_many({"bike_id": bike_id})
    
    return {"message": "Bike deleted successfully"}

# ===== EXPENSE ROUTES =====

@api_router.post("/expenses", response_model=ExpenseResponse)
async def create_expense(expense_data: ExpenseCreate, current_user: dict = Depends(get_current_user)):
    # Verify bike belongs to user
    bike = await db.bikes.find_one({"id": expense_data.bike_id, "user_id": current_user["id"]}, {"_id": 0})
    if not bike:
        raise HTTPException(status_code=404, detail="Bike not found")
    
    from uuid import uuid4
    expense_id = str(uuid4())
    expense_doc = {
        "id": expense_id,
        "user_id": current_user["id"],
        "bike_id": expense_data.bike_id,
        "type": expense_data.type,
        "amount": expense_data.amount,
        "date": expense_data.date,
        "odometer": expense_data.odometer,
        "notes": expense_data.notes,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.expenses.insert_one(expense_doc)
    return expense_doc

@api_router.get("/expenses", response_model=List[ExpenseResponse])
async def get_expenses(
    bike_id: Optional[str] = None,
    type: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {"user_id": current_user["id"]}
    
    if bike_id:
        query["bike_id"] = bike_id
    if type:
        query["type"] = type
    if search:
        query["notes"] = {"$regex": search, "$options": "i"}
    
    expenses = await db.expenses.find(query, {"_id": 0}).sort("date", -1).to_list(1000)
    return expenses

@api_router.put("/expenses/{expense_id}", response_model=ExpenseResponse)
async def update_expense(expense_id: str, expense_data: ExpenseUpdate, current_user: dict = Depends(get_current_user)):
    expense = await db.expenses.find_one({"id": expense_id, "user_id": current_user["id"]}, {"_id": 0})
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    update_data = {k: v for k, v in expense_data.model_dump().items() if v is not None}
    if update_data:
        await db.expenses.update_one({"id": expense_id}, {"$set": update_data})
        expense.update(update_data)
    
    return expense

@api_router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.expenses.delete_one({"id": expense_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    return {"message": "Expense deleted successfully"}

# ===== DASHBOARD ROUTE =====

@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    # Get all expenses
    expenses = await db.expenses.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(10000)
    
    # Calculate total
    total_expenses = sum(exp["amount"] for exp in expenses)
    
    # Category breakdown
    category_breakdown = {}
    for exp in expenses:
        exp_type = exp["type"]
        category_breakdown[exp_type] = category_breakdown.get(exp_type, 0) + exp["amount"]
    
    # Recent expenses (last 5)
    recent = sorted(expenses, key=lambda x: x["date"], reverse=True)[:5]
    
    # Total bikes
    bikes_count = await db.bikes.count_documents({"user_id": current_user["id"]})
    
    return {
        "total_expenses": total_expenses,
        "category_breakdown": category_breakdown,
        "recent_expenses": recent,
        "total_bikes": bikes_count
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()