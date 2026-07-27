from typing import Annotated

from fastapi import Depends, HTTPException
from starlette import status

from app.dependencies.user import user_dependency


async def get_current_admin(user: user_dependency):
    """
    Ensure the current authenticated user has administrator privileges.
    """

    if user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource.",
        )

    return user


admin_dependency = Annotated[
    dict,
    Depends(get_current_admin),
]
