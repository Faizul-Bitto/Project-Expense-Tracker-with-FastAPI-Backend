from pydantic import BaseModel


class CreateExpenseCategoryRequest(BaseModel):
    name: str


class UpdateExpenseCategoryRequest(BaseModel):
    name: str
