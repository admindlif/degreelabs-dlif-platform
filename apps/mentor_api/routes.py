"""
Mentor Portal — /me route.

Only accessible to users with role=MENTOR or PROGRAM_MANAGER.
"""

from fastapi import APIRouter, Depends

from app.core.permissions import require_mentor_portal
from app.models.user import User
from app.schemas.auth import UserResponse


router = APIRouter(prefix="/mentor-portal", tags=["Mentor"])


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Return current mentor profile",
)
@router.get(
    "/portal/me",
    response_model=UserResponse,
    summary="Return current mentor profile (portal alias)",
)
def mentor_me(
    current_user: User = Depends(require_mentor_portal),
) -> UserResponse:
    """
    Return the profile of the currently authenticated mentor.

    Rejects any non-mentor JWT with HTTP 403.
    """
    return UserResponse.model_validate(current_user)
