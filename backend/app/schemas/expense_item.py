from decimal import Decimal

from pydantic import BaseModel, Field


class ExpenseItemRequest(BaseModel):
    expense_category_id: int = Field(gt=0)
    description: str
    amount: Decimal = Field(gt=0)
