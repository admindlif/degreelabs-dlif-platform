from uuid import UUID

from sqlalchemy.orm import Session

from app.models.resource import Resource


def get_resources_for_phase(db: Session, phase_id: UUID) -> list[Resource]:
    """
    Return all active Resources for a given phase, ordered by sequence.
    """
    return (
        db.query(Resource)
        .filter(
            Resource.phase_id == phase_id,
            Resource.is_active == True,  # noqa: E712
        )
        .order_by(Resource.sequence)
        .all()
    )
