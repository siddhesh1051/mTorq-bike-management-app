from fastapi import APIRouter, Depends
from models import UserSignup, UserLogin, TokenResponse, UserUpdateName, UserUpdatePassword, UserResponse
from services import AuthService
from routes.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=TokenResponse)
async def signup(user_data: UserSignup):
    """Register a new user"""
    return await AuthService.signup(user_data)


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login with email and password"""
    return await AuthService.login(credentials)


@router.put("/update-name", response_model=UserResponse)
async def update_name(name_data: UserUpdateName, current_user: dict = Depends(get_current_user)):
    """Update user name"""
    return await AuthService.update_name(current_user["id"], name_data)


@router.put("/update-password")
async def update_password(password_data: UserUpdatePassword, current_user: dict = Depends(get_current_user)):
    """Update user password"""
    return await AuthService.update_password(current_user["id"], password_data)
