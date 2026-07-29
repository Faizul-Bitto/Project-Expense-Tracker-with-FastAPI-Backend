import os
from datetime import timedelta

from fastapi import APIRouter, HTTPException
from starlette import status

from app.core.logger import logger
from app.core.security import authenticate_user, bcrypt_context, create_access_token
from app.dependencies.auth import login_token_field_dependency
from app.dependencies.database import db_dependency
from app.models.user import User
from app.schemas.auth import CreateUserRequest, Token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def create_user(db: db_dependency, create_user_request: CreateUserRequest):
    """
    Register a new user.

    Creates a new user account after validating that the email
    address is unique.

    Raises:
        HTTPException: If the email is already registered.
    """

    existing_user = (
        db.query(User).filter(User.email == create_user_request.email).first()
    )

    if existing_user:
        logger.warning(
            f"⚠️ Registration Failed | Email={create_user_request.email} already exists."
        )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered.",
        )

    user = User(
        name=create_user_request.name,
        email=create_user_request.email,
        password=bcrypt_context.hash(create_user_request.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    logger.info(
        f"✅ User Registered | ID={user.id} | Email={user.email} | Role={user.role}"
    )

    return {
        "message": "User registered successfully.",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        },
    }


@router.post("/login", response_model=Token, status_code=status.HTTP_200_OK)
async def login(form_data: login_token_field_dependency, db: db_dependency):
    """
    Authenticate a user and return a JWT access token.

    Raises:
        HTTPException: If the credentials are invalid.
    """

    user = authenticate_user(
        email=form_data.username,
        password=form_data.password,
        db=db,
    )

    if not user:
        logger.warning(f"❌ Login Failed | Email={form_data.username}")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    token = create_access_token(
        email=user.email,
        user_id=user.id,
        role=user.role,
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    logger.info(
        f"🔐 User Logged In | ID={user.id} | Email={user.email} | Role={user.role}"
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }
