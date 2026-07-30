from datetime import date

from pydantic import BaseModel, EmailStr, Field

from app.schemas.expense_item import ExpenseItemRequest


class AdminCreateUserRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6)
    role: str


class AdminUpdateUserRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6)
    role: str


class AdminCreateExpenseRequest(BaseModel):
    date: date

    items: list[ExpenseItemRequest] = Field(
        min_length=1,
    )


class AdminUpdateExpenseRequest(BaseModel):
    date: date

    items: list[ExpenseItemRequest] = Field(
        min_length=1,
    )
