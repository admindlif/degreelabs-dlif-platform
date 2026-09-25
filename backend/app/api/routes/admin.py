"""
Admin routes.

Only ADMIN and SUPER_ADMIN roles may access these endpoints.

POST /api/v1/admin/students   — create a student and send invitation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.auth import (
    CreateFellowRequest,
    CreateFellowResponse,
    CreateStudentRequest,
    CreateStudentResponse,
)
from app.services.auth import DuplicateEmailError, admin_create_fellow, admin_create_student
from app.services.invitation import send_invitation_email


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.post(
    "/fellows",
    response_model=CreateFellowResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new Fellow and send invitation email",
)
@router.post(
    "/students",
    response_model=CreateFellowResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new Fellow (legacy alias) and send invitation email",
    deprecated=True,
)
def create_fellow(
    data: CreateFellowRequest,
    db: Session = Depends(get_db),
    _admin: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    ),
) -> CreateFellowResponse:
    """
    Admin-only endpoint to create a new Fellow account.

    The Fellow is created with:
    - role = fellow
    - account_status = invited
    - password_hash = NULL
    - two_factor_enabled = false

    A secure invitation email is sent to the Fellow's address.
    The plain-text token is never stored or returned in this response.
    """
    try:
        user, raw_token = admin_create_fellow(db, data)
    except DuplicateEmailError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    # Send invitation email after the transaction is committed.
    # Any email failure is intentionally not rolled back — the user
    # record exists and an admin can re-trigger the invitation.
    try:
        send_invitation_email(user=user, raw_token=raw_token)
    except Exception:  # noqa: BLE001
        # Log but don't fail the request — the admin UI can show a
        # "resend invitation" option if email delivery fails.
        import logging
        logging.getLogger(__name__).exception(
            "Failed to send invitation email to user_id=%s", user.id
        )

    return CreateStudentResponse.model_validate(user)
