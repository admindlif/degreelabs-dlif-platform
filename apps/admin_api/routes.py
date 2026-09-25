"""
Admin Portal — /me route.

Only accessible to users with role=ADMIN or SUPER_ADMIN.
"""

from fastapi import APIRouter, Depends

from app.core.permissions import require_admin_portal
from app.models.user import User
from app.schemas.auth import UserResponse


router = APIRouter(prefix="/admin-portal", tags=["Admin Portal"])


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Return current admin profile",
)
@router.get(
    "/portal/me",
    response_model=UserResponse,
    summary="Return current admin profile (portal alias)",
)
def admin_me(
    current_user: User = Depends(require_admin_portal),
) -> UserResponse:
    """
    Return the profile of the currently authenticated admin.

    Rejects any non-admin JWT with HTTP 403.
    """
    return UserResponse.model_validate(current_user)
