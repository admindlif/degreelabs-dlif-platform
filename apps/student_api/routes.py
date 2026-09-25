"""
Fellow Portal — /me route.

Returns the current Fellow's profile.
Only accessible to users with role=FELLOW (or legacy STUDENT).
"""

from fastapi import APIRouter, Depends

from app.core.permissions import require_fellow_portal
from app.models.user import User
from app.schemas.auth import UserResponse


router = APIRouter(prefix="/student-portal", tags=["Fellow"])


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Return current Fellow profile",
)
@router.get(
    "/portal/me",
    response_model=UserResponse,
    summary="Return current Fellow profile (portal alias)",
)
def fellow_me(
    current_user: User = Depends(require_fellow_portal),
) -> UserResponse:
    """
    Return the profile of the currently authenticated Fellow.

    Rejects any non-Fellow JWT with HTTP 403.
    """
    return UserResponse.model_validate(current_user)

