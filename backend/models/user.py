from pydantic import BaseModel, EmailStr, ConfigDict


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


class UserUpdateName(BaseModel):
    name: str


class UserUpdatePassword(BaseModel):
    current_password: str
    new_password: str
