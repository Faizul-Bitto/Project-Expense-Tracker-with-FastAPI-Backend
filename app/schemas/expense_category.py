from pydantic import BaseModel


class CreateExpenseCategoryRequest(BaseModel):
    name: str
