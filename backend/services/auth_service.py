from datetime import datetime, timezone, timedelta
from uuid import uuid4
from passlib.context import CryptContext
import jwt
from fastapi import HTTPException
from config.database import db
from config import JWT_SECRET_KEY, JWT_ALGORITHM, JWT_EXPIRY_DAYS
from models import UserSignup, UserLogin


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def create_access_token(data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRY_DAYS)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

    @staticmethod
    async def get_user_by_id(user_id: str) -> dict:
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user

    @staticmethod
    async def signup(user_data: UserSignup) -> dict:
        existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        user_id = str(uuid4())
        user_doc = {
            "id": user_id,
            "email": user_data.email,
            "password_hash": AuthService.hash_password(user_data.password),
            "name": user_data.name,
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        await db.users.insert_one(user_doc)
        token = AuthService.create_access_token({"user_id": user_id})

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "email": user_data.email,
                "name": user_data.name,
                "created_at": user_doc["created_at"]
            }
        }

    @staticmethod
    async def login(credentials: UserLogin) -> dict:
        user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
        if not user or not AuthService.verify_password(credentials.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token = AuthService.create_access_token({"user_id": user["id"]})

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "email": user["email"],
                "name": user["name"],
                "created_at": user["created_at"]
            }
        }
