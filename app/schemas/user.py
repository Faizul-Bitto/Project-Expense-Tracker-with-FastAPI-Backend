from pydantic import BaseModel, EmailStr, Field


class UserUpdatePasswordRequest(BaseModel):
    password: str
    new_password: str = Field(min_length=6)


class UpdateUserRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
