import os
from contextlib import asynccontextmanager
from time import perf_counter

from dotenv import load_dotenv
from fastapi import FastAPI
from sqlalchemy import text

from app.core.database import Base, SessionLocal, engine
from app.core.logger import logger

# Import all models so SQLAlchemy can register them
from app.models.user import User
from app.models.expense import Expense
from app.models.expense_item import ExpenseItem
from app.models.expense_category import ExpenseCategory

# Import routers
from app.routers import auth, expenses, expense_categories, users, analytics

from starlette import status

# Load environment variables
load_dotenv()

DEFAULT_ADMIN_NAME = os.getenv("DEFAULT_ADMIN_NAME")
DEFAULT_ADMIN_EMAIL = os.getenv("DEFAULT_ADMIN_EMAIL")
DEFAULT_ADMIN_PASSWORD = os.getenv("DEFAULT_ADMIN_PASSWORD")


@asynccontextmanager
async def lifespan(app: FastAPI):
    startup_time = perf_counter()

    try:
        # Check database connection
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        logger.info("✅ Database Connected Successfully")

        # Development Only
        Base.metadata.create_all(bind=engine)
        logger.info("📦 Database Tables Synchronized")

        # Create or Update Default Admin
        db = SessionLocal()

        try:
            admin = db.query(User).filter(User.email == DEFAULT_ADMIN_EMAIL).first()

            if admin:
                updated = False

                if admin.name != DEFAULT_ADMIN_NAME:
                    admin.name = DEFAULT_ADMIN_NAME
                    updated = True

                if admin.password != DEFAULT_ADMIN_PASSWORD:
                    admin.password = DEFAULT_ADMIN_PASSWORD
                    updated = True

                if admin.role != "admin":
                    admin.role = "admin"
                    updated = True

                if updated:
                    db.commit()
                    db.refresh(admin)
                    logger.info("🔄 Default Admin Updated Successfully")
                else:
                    logger.info("👤 Default Admin Already Up-to-Date")

            else:
                admin = User(
                    name=DEFAULT_ADMIN_NAME,
                    email=DEFAULT_ADMIN_EMAIL,
                    password=DEFAULT_ADMIN_PASSWORD,
                    role="admin",
                )

                db.add(admin)
                db.commit()
                db.refresh(admin)

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

# Register Routers
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(expense_categories.router)
app.include_router(expenses.router)
app.include_router(analytics.router)


@app.get("/healthy", tags=["API Health"], status_code=status.HTTP_200_OK)
async def health_check():
    """
    Health check endpoint.

    Used to verify API availability.
    """
    return {"status": "Healthy"}
