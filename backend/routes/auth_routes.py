from fastapi import APIRouter
from models import UserSignup, UserLogin, TokenResponse
from services import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=TokenResponse)
async def signup(user_data: UserSignup):
    """Register a new user"""
    return await AuthService.signup(user_data)


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login with email and password"""
    return await AuthService.login(credentials)
