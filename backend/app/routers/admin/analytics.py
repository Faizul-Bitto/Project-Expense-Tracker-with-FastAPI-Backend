from calendar import monthrange
from datetime import date, timedelta

from fastapi import APIRouter
from sqlalchemy import func
from starlette import status

from app.core.logger import logger
from app.dependencies.admin import admin_dependency
from app.dependencies.database import db_dependency
from app.models.expense import Expense
from app.models.expense_category import ExpenseCategory
from app.models.expense_item import ExpenseItem
from app.models.user import User

router = APIRouter(
    prefix="/admin/analytics",
    tags=["Admin - Analytics"],
)


# ============================================================
# Helper Functions
# ============================================================
def get_week_start(target_date: date) -> date:
    """
    Return Monday of the week containing target_date.
    """

    return target_date - timedelta(days=target_date.weekday())


def get_month_start(target_date: date) -> date:
    """
    Return the first day of the current month.
    """

    return target_date.replace(day=1)


def get_next_month(target_date: date) -> date:
    """
    Return the first day of the next month.
    """

    if target_date.month == 12:
        return date(
            target_date.year + 1,
            1,
            1,
        )

    return date(
        target_date.year,
        target_date.month + 1,
        1,
    )


# ============================================================
# Admin Analytics Summary
# ============================================================
@router.get("/summary", status_code=status.HTTP_200_OK)
async def get_admin_analytics_summary(
    admin: admin_dependency,
    db: db_dependency,
):
    """
    Get overall system analytics for administrators.

    Includes:

        - Total users
        - Total expenses
        - Total spending
        - Average expense
        - Highest expense
        - Today's spending
        - Weekly spending
        - Monthly spending
        - Yearly spending
    """

    today = date.today()

    # --------------------------------------------------------
    # Date Ranges
    # --------------------------------------------------------
    week_start = get_week_start(today)
    next_week_start = week_start + timedelta(days=7)

    month_start = get_month_start(today)
    next_month_start = get_next_month(today)

    year_start = today.replace(
        month=1,
        day=1,
    )

    next_year_start = date(
        today.year + 1,
        1,
        1,
    )

    # --------------------------------------------------------
    # User Statistics
    # --------------------------------------------------------
    total_users = db.query(func.count(User.id)).filter(User.role != "admin").scalar()

    total_admins = db.query(func.count(User.id)).filter(User.role == "admin").scalar()

    # --------------------------------------------------------
    # Expense Statistics
    # --------------------------------------------------------
    total_expenses = (
        db.query(func.count(Expense.id))
        .join(
            User,
            User.id == Expense.user_id,
        )
        .filter(User.role != "admin")
        .scalar()
    )

    total_spending = (
        db.query(
            func.coalesce(
                func.sum(Expense.total_amount),
                0,
            )
        )
        .join(
            User,
            User.id == Expense.user_id,
        )
        .filter(User.role != "admin")
        .scalar()
    )

    average_expense = (
        db.query(
            func.coalesce(
                func.avg(Expense.total_amount),
                0,
            )
        )
        .join(
            User,
            User.id == Expense.user_id,
        )
        .filter(User.role != "admin")
        .scalar()
    )

    highest_expense = (
        db.query(
            func.coalesce(
                func.max(Expense.total_amount),
                0,
            )
        )
        .join(
            User,
            User.id == Expense.user_id,
        )
        .filter(User.role != "admin")
        .scalar()
    )

    # --------------------------------------------------------
    # Today's Spending
    # --------------------------------------------------------
    today_spending = (
        db.query(
            func.coalesce(
                func.sum(Expense.total_amount),
                0,
            )
        )
        .join(
            User,
            User.id == Expense.user_id,
        )
        .filter(
            User.role != "admin",
            Expense.date == today,
        )
        .scalar()
    )

    # --------------------------------------------------------
    # Weekly Spending
    # --------------------------------------------------------
    weekly_spending = (
        db.query(
            func.coalesce(
                func.sum(Expense.total_amount),
                0,
            )
        )
        .join(
            User,
            User.id == Expense.user_id,
        )
        .filter(
            User.role != "admin",
            Expense.date >= week_start,
            Expense.date < next_week_start,
        )
        .scalar()
    )

    # --------------------------------------------------------
    # Monthly Spending
    # --------------------------------------------------------
    monthly_spending = (
        db.query(
            func.coalesce(
                func.sum(Expense.total_amount),
                0,
            )
        )
        .join(
            User,
            User.id == Expense.user_id,
        )
        .filter(
            User.role != "admin",
            Expense.date >= month_start,
            Expense.date < next_month_start,
        )
        .scalar()
    )

    # --------------------------------------------------------
    # Yearly Spending
    # --------------------------------------------------------
    yearly_spending = (
        db.query(
            func.coalesce(
                func.sum(Expense.total_amount),
                0,
            )
        )
        .join(
            User,
            User.id == Expense.user_id,
        )
        .filter(
            User.role != "admin",
            Expense.date >= year_start,
            Expense.date < next_year_start,
        )
        .scalar()
    )

    logger.info(f"📊 Admin Analytics Summary Retrieved | " f"Admin={admin.email}")

    return {
        "message": "Admin analytics summary retrieved successfully.",
        "summary": {
            "total_users": total_users,
            "total_admins": total_admins,
            "total_expenses": total_expenses,
            "total_spending": total_spending,
            "average_expense": average_expense,
            "highest_expense": highest_expense,
            "today_spending": today_spending,
            "weekly_spending": weekly_spending,
            "monthly_spending": monthly_spending,
            "yearly_spending": yearly_spending,
        },
    }


# ============================================================
# User Statistics
# ============================================================
@router.get("/users", status_code=status.HTTP_200_OK)
async def get_admin_user_analytics(
    admin: admin_dependency,
    db: db_dependency,
):
    """
    Get user-wise spending statistics.

    Shows:

        - User information
        - Total expenses
        - Total spending
        - Average expense
        - Highest expense

    Admin accounts are excluded.
    """

    user_statistics = (
        db.query(
            User.id,
            User.name,
            User.email,
            func.count(Expense.id).label("expense_count"),
            func.coalesce(
                func.sum(Expense.total_amount),
                0,
            ).label("total_spending"),
            func.coalesce(
                func.avg(Expense.total_amount),
                0,
            ).label("average_expense"),
            func.coalesce(
                func.max(Expense.total_amount),
                0,
            ).label("highest_expense"),
        )
        .outerjoin(
            Expense,
            Expense.user_id == User.id,
        )
        .filter(
            User.role != "admin",
        )
        .group_by(
            User.id,
            User.name,
            User.email,
        )
        .order_by(func.sum(Expense.total_amount).desc())
        .all()
    )

    users = [
        {
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "expense_count": user.expense_count,
            "total_spending": user.total_spending,
            "average_expense": user.average_expense,
            "highest_expense": user.highest_expense,
        }
        for user in user_statistics
    ]

    logger.info(
        f"👥 Admin User Analytics Retrieved | "
        f"Count={len(users)} | "
        f"Admin={admin.email}"
    )

    return {
        "message": "User analytics retrieved successfully.",
        "users": users,
    }


# ============================================================
# Top Spending Users
# ============================================================
@router.get("/top-users", status_code=status.HTTP_200_OK)
async def get_top_spending_users(
    admin: admin_dependency,
    db: db_dependency,
):
    """
    Get users ranked by total spending.

    Returns the top 10 spending users.
    """

    top_users = (
        db.query(
            User.id,
            User.name,
            User.email,
            func.count(Expense.id).label("expense_count"),
            func.coalesce(
                func.sum(Expense.total_amount),
                0,
            ).label("total_spending"),
        )
        .join(
            Expense,
            Expense.user_id == User.id,
        )
        .filter(
            User.role != "admin",
        )
        .group_by(
            User.id,
            User.name,
            User.email,
        )
        .order_by(func.sum(Expense.total_amount).desc())
        .limit(10)
        .all()
    )

    users = [
        {
            "rank": index,
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "expense_count": user.expense_count,
            "total_spending": user.total_spending,
        }
        for index, user in enumerate(
            top_users,
            start=1,
        )
    ]

    logger.info(f"🏆 Top Spending Users Retrieved | " f"Admin={admin.email}")

    return {
        "message": "Top spending users retrieved successfully.",
        "users": users,
    }


# ============================================================
# Category Analytics
# ============================================================
@router.get("/categories", status_code=status.HTTP_200_OK)
async def get_admin_category_analytics(
    admin: admin_dependency,
    db: db_dependency,
):
    """
    Get system-wide expense category statistics.

    Shows:

        - Category name
        - Total spending
        - Number of expense items
        - Percentage of total spending
    """

    category_statistics = (
        db.query(
            ExpenseCategory.id,
            ExpenseCategory.name,
            func.count(ExpenseItem.id).label("expense_count"),
            func.coalesce(
                func.sum(ExpenseItem.amount),
                0,
            ).label("total_spending"),
        )
        .outerjoin(
            ExpenseItem,
            ExpenseItem.expense_category_id == ExpenseCategory.id,
        )
        .outerjoin(
            Expense,
            Expense.id == ExpenseItem.expense_id,
        )
        .outerjoin(
            User,
            User.id == Expense.user_id,
        )
        .filter(
            (User.role != "admin") | (User.id.is_(None)),
        )
        .group_by(
            ExpenseCategory.id,
            ExpenseCategory.name,
        )
        .order_by(func.sum(ExpenseItem.amount).desc())
        .all()
    )

    total_spending = sum(category.total_spending for category in category_statistics)

    categories = []

    for category in category_statistics:

        percentage = 0

        if total_spending:
            percentage = round(
                float(category.total_spending / total_spending) * 100,
                2,
            )

        categories.append(
            {
                "category_id": category.id,
                "category_name": category.name,
                "expense_count": category.expense_count,
                "total_spending": category.total_spending,
                "percentage": percentage,
            }
        )

    logger.info(f"🥧 Admin Category Analytics Retrieved | " f"Admin={admin.email}")

    return {
        "message": "Category analytics retrieved successfully.",
        "total_spending": total_spending,
        "categories": categories,
    }


# ============================================================
# Monthly Spending Trend
# ============================================================
@router.get("/monthly-trend", status_code=status.HTTP_200_OK)
async def get_admin_monthly_trend(
    admin: admin_dependency,
    db: db_dependency,
):
    """
    Get system-wide monthly spending for the current year.
    """

    today = date.today()

    monthly_data = []

    for month_number in range(1, 13):

        month_start = date(
            today.year,
            month_number,
            1,
        )

        if month_number == 12:
            next_month = date(
                today.year + 1,
                1,
                1,
            )
        else:
            next_month = date(
                today.year,
                month_number + 1,
                1,
            )

        total_spending = (
            db.query(
                func.coalesce(
                    func.sum(Expense.total_amount),
                    0,
                )
            )
            .join(
                User,
                User.id == Expense.user_id,
            )
            .filter(
                User.role != "admin",
                Expense.date >= month_start,
                Expense.date < next_month,
            )
            .scalar()
        )

        expense_count = (
            db.query(func.count(Expense.id))
            .join(
                User,
                User.id == Expense.user_id,
            )
            .filter(
                User.role != "admin",
                Expense.date >= month_start,
                Expense.date < next_month,
            )
            .scalar()
        )

        monthly_data.append(
            {
                "month": month_number,
                "month_name": month_start.strftime("%B"),
                "total_spending": total_spending,
                "expense_count": expense_count,
            }
        )

    logger.info(
        f"📈 Admin Monthly Trend Retrieved | "
        f"Year={today.year} | "
        f"Admin={admin.email}"
    )

    return {
        "message": "Monthly spending trend retrieved successfully.",
        "year": today.year,
        "monthly_breakdown": monthly_data,
    }


# ============================================================
# Weekly Spending Trend
# ============================================================
@router.get("/weekly-trend", status_code=status.HTTP_200_OK)
async def get_admin_weekly_trend(
    admin: admin_dependency,
    db: db_dependency,
):
    """
    Get system-wide daily spending for the current week.
    """

    today = date.today()
    week_start = get_week_start(today)

    weekly_data = []

    for day_offset in range(7):

        current_day = week_start + timedelta(days=day_offset)

        total_spending = (
            db.query(
                func.coalesce(
                    func.sum(Expense.total_amount),
                    0,
                )
            )
            .join(
                User,
                User.id == Expense.user_id,
            )
            .filter(
                User.role != "admin",
                Expense.date == current_day,
            )
            .scalar()
        )

        expense_count = (
            db.query(func.count(Expense.id))
            .join(
                User,
                User.id == Expense.user_id,
            )
            .filter(
                User.role != "admin",
                Expense.date == current_day,
            )
            .scalar()
        )

        weekly_data.append(
            {
                "date": current_day,
                "day": current_day.strftime("%A"),
                "total_spending": total_spending,
                "expense_count": expense_count,
            }
        )

    logger.info(f"📊 Admin Weekly Trend Retrieved | " f"Admin={admin.email}")

    return {
        "message": "Weekly spending trend retrieved successfully.",
        "week_start": week_start,
        "week_end": week_start + timedelta(days=6),
        "daily_breakdown": weekly_data,
    }


# ============================================================
# Recent Spending Activity
# ============================================================
@router.get("/recent-expenses", status_code=status.HTTP_200_OK)
async def get_recent_expenses(
    admin: admin_dependency,
    db: db_dependency,
):
    """
    Get the latest 10 expenses across all users.
    """

    recent_expenses = (
        db.query(
            Expense.id,
            Expense.date,
            Expense.total_amount,
            User.id.label("user_id"),
            User.name.label("user_name"),
            User.email.label("user_email"),
        )
        .join(
            User,
            User.id == Expense.user_id,
        )
        .filter(
            User.role != "admin",
        )
        .order_by(Expense.id.desc())
        .limit(10)
        .all()
    )

    expenses = [
        {
            "expense_id": expense.id,
            "date": expense.date,
            "total_amount": expense.total_amount,
            "user": {
                "id": expense.user_id,
                "name": expense.user_name,
                "email": expense.user_email,
            },
        }
        for expense in recent_expenses
    ]

    logger.info(
        f"🧾 Recent Expenses Retrieved | "
        f"Count={len(expenses)} | "
        f"Admin={admin.email}"
    )

    return {
        "message": "Recent expenses retrieved successfully.",
        "expenses": expenses,
    }
