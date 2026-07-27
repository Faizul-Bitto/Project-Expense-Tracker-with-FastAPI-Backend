from typing import Annotated

from fastapi import Depends, HTTPException
from starlette import status

from app.core.authentication import get_current_user


async def get_current_admin(
    current_user=Depends(get_current_user),
):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource.",
        )

    return current_user


admin_dependency = Annotated[
    dict,
    Depends(get_current_admin),
]
