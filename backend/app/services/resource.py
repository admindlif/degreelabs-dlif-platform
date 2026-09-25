from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.discover import get_phase_by_code
from app.repositories.enrollment import get_active_enrollment_for_user
from app.repositories.resource import get_resources_for_phase
from app.schemas.team_resource import ResourceResponse


def get_fellow_resources(db: Session, current_user: User) -> list[ResourceResponse]:
    """
    Return the active Resources for the Fellow's current phase (e.g., DISCOVER).
    Returns an empty list (not a 404) if no resources are seeded yet — the
    frontend will gracefully show the fallback toolkit items.
    """
    enrollment = get_active_enrollment_for_user(db, current_user.id)
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active enrollment found for this Fellow.",
        )

    cohort = enrollment.cohort
    program = cohort.program

    phase = get_phase_by_code(db, program.id, code="DISCOVER")
    if not phase:
        return []

    resources = get_resources_for_phase(db, phase.id)

    return [
        ResourceResponse(
            id=str(r.id),
            title=r.title,
            subtitle=r.subtitle,
            resource_type=r.resource_type.value,
            url=r.url,
            is_downloadable=r.is_downloadable,
            sequence=r.sequence,
        )
        for r in resources
    ]
