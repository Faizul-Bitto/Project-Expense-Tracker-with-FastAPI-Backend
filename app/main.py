from contextlib import asynccontextmanager
from time import perf_counter

from fastapi import FastAPI
from sqlalchemy import text

from app.core.database import engine
from app.core.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    startup_time = perf_counter()

    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        elapsed = perf_counter() - startup_time

        logger.info("🚀 Expense Tracker API Started")
        logger.info("✅ Database Connected Successfully")

        if elapsed < 1:
            logger.info(f"⚡ Startup Time: {elapsed * 1000:.2f} ms")
        else:
            logger.info(f"⚡ Startup Time: {elapsed:.2f} s")

    except Exception as e:
        logger.error(f"❌ Database Connection Failed: {e}")

    yield

    logger.info("🛑 Application Shutdown")


app = FastAPI(
    title="Expense Tracker API",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/healthy")
async def health_check():
    return {"status": "Healthy"}
