from datetime import date

from pydantic import BaseModel, Field

from app.schemas.expense_item import ExpenseItemRequest


class CreateExpenseRequest(BaseModel):
    date: date

    items: list[ExpenseItemRequest] = Field(
        min_length=1,
    )


class UpdateExpenseRequest(BaseModel):
    date: date

    items: list[ExpenseItemRequest] = Field(
        min_length=1,
    )
