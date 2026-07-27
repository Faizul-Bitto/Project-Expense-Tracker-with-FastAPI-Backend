from fastapi import APIRouter

router = APIRouter(
    prefix="/expense-categories",
    tags=["Expense Categories"],
)
