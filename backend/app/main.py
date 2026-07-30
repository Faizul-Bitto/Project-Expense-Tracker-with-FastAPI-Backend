import os
from contextlib import asynccontextmanager
from time import perf_counter

from dotenv import load_dotenv
from fastapi import FastAPI
from sqlalchemy import text
from starlette import status

from app.core.database import Base, SessionLocal, engine
from app.core.logger import logger
from app.core.security import bcrypt_context

# Import all models so SQLAlchemy can register them
from app.models.user import User
from app.models.expense import Expense
from app.models.expense_category import ExpenseCategory
from app.models.expense_item import ExpenseItem
from app.models.password_reset import PasswordReset

# Import routers
from app.routers import (
    analytics,
    auth,
    expense_categories,
    expenses,
    users,
)

# Admin routers
from app.routers.admin import (
    expense_categories as admin_expense_categories,
    expenses as admin_expenses,
    users as admin_users,
)

# Load environment variables
load_dotenv()

DEFAULT_ADMIN_NAME = os.getenv("DEFAULT_ADMIN_NAME")
DEFAULT_ADMIN_EMAIL = os.getenv("DEFAULT_ADMIN_EMAIL")
DEFAULT_ADMIN_PASSWORD = os.getenv("DEFAULT_ADMIN_PASSWORD")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown events.
    """

    startup_time = perf_counter()

    try:
        # Check database connection
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        logger.info("✅ Database Connected Successfully")

        Base.metadata.create_all(bind=engine)
        logger.info("📦 Database Tables Synchronized")

        db = SessionLocal()

        try:
            # Find the default admin
            admin_user = db.query(User).filter(User.role == "admin").first()

            if admin_user:
                updated = False

                # Update name
                if admin_user.name != DEFAULT_ADMIN_NAME:
                    admin_user.name = DEFAULT_ADMIN_NAME
                    updated = True

                # Update email
                if admin_user.email != DEFAULT_ADMIN_EMAIL:
                    admin_user.email = DEFAULT_ADMIN_EMAIL
                    updated = True

                # Update password
                if not bcrypt_context.verify(
                    DEFAULT_ADMIN_PASSWORD,
                    admin_user.password,
                ):
                    admin_user.password = bcrypt_context.hash(DEFAULT_ADMIN_PASSWORD)
                    updated = True

                if updated:
                    db.commit()
                    db.refresh(admin_user)

                    logger.info("🔄 Default Admin Updated Successfully")
                else:
                    logger.info("👤 Default Admin Already Up-to-Date")

            else:
                admin_user = User(
                    name=DEFAULT_ADMIN_NAME,
                    email=DEFAULT_ADMIN_EMAIL,
                    password=bcrypt_context.hash(DEFAULT_ADMIN_PASSWORD),
                    role="admin",
                )

                db.add(admin_user)
                db.commit()
                db.refresh(admin_user)

                logger.info("✅ Default Admin Created Successfully")

        finally:
            db.close()

        elapsed = perf_counter() - startup_time

        logger.info("🚀 Expense Tracker API Started")

        if elapsed < 1:
            logger.info(f"⚡ Startup Time: {elapsed * 1000:.2f} ms")
        else:
            logger.info(f"⚡ Startup Time: {elapsed:.2f} s")

    except Exception:
        logger.exception("❌ Failed to Start Application")

    yield

    logger.info("🛑 Application Shutdown")


app = FastAPI(
    title="Expense Tracker API",
    version="1.0.0",
    lifespan=lifespan,
)


# --------------------------
# Register User Routers
# --------------------------

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(expense_categories.router)
app.include_router(expenses.router)
app.include_router(analytics.router)


# --------------------------
# Register Admin Routers
# --------------------------

app.include_router(admin_users.router)
app.include_router(admin_expense_categories.router)
app.include_router(admin_expenses.router)


@app.get(
    "/healthy",
    tags=["API Health"],
    status_code=status.HTTP_200_OK,
)
async def health_check():
    """
    Health check endpoint.

    Used to verify API availability.
    """

    return {
        "status": "Healthy",
    }
