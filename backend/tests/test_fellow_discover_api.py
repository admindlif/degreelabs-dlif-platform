"""
Tests for Fellow API Milestone 1:
- Program, Cohort, Enrollment
- Phase DISCOVER, Weeks, Sessions
- Context, Overview, Weeks, Session detail
- Cohort isolation and security checks
"""

import sys
from pathlib import Path
from uuid import uuid4
from datetime import datetime, timezone, timedelta, date

repo_root = Path(__file__).resolve().parent.parent.parent
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))

import pytest
from starlette.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password
from app.models.cohort import Cohort, CohortStatus
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.phase import Phase
from app.models.program import Program
from app.models.session import Session as DBSession, SessionStatus, SessionType
from app.models.user import AccountStatus, User, UserRole
from app.models.week import Week
from apps.student_api.main import app as student_app


@pytest.fixture
def student_client():
    return TestClient(student_app)


@pytest.fixture
def fellow_user(db: Session) -> User:
    email = f"fellow_{uuid4().hex[:8]}@degreelabs.com"
    user = User(
        first_name="Samantha",
        last_name="Fellow",
        email=email,
        password_hash=hash_password("Pass12345!"),
        role=UserRole.FELLOW,
        account_status=AccountStatus.ACTIVE,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    yield user
    db.query(Enrollment).filter(Enrollment.user_id == user.id).delete()
    db.delete(user)
    db.commit()


@pytest.fixture
def mentor_user(db: Session) -> User:
    email = f"mentor_{uuid4().hex[:8]}@degreelabs.com"
    user = User(
        first_name="Marcus",
        last_name="Mentor",
        email=email,
        password_hash=hash_password("Pass12345!"),
        role=UserRole.MENTOR,
        account_status=AccountStatus.ACTIVE,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    yield user
    db.delete(user)
    db.commit()


@pytest.fixture
def setup_fellow_cohort(db: Session, fellow_user: User):
    """
    Ensure DLIF program, Cohort 2026-A, DISCOVER phase, and fellow enrollment exist.
    """
    program = db.query(Program).filter(Program.code == "DLIF").first()
    if not program:
        program = Program(name="DegreeLabs Impact Fellowship", code="DLIF", is_active=True)
        db.add(program)
        db.commit()
        db.refresh(program)

    cohort = db.query(Cohort).filter(Cohort.code == "2026-A").first()
    if not cohort:
        cohort = Cohort(
            program_id=program.id,
            name="DLIF Cohort 2026-A",
            code="2026-A",
            status=CohortStatus.ACTIVE,
        )
        db.add(cohort)
        db.commit()
        db.refresh(cohort)

    phase = db.query(Phase).filter(Phase.program_id == program.id, Phase.code == "DISCOVER").first()
    if not phase:
        phase = Phase(
            program_id=program.id,
            code="DISCOVER",
            name="DISCOVER",
            development_role="THINK",
            sequence=1,
            duration_weeks=4,
        )
        db.add(phase)
        db.commit()
        db.refresh(phase)

    enrollment = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == fellow_user.id, Enrollment.cohort_id == cohort.id)
        .first()
    )
    if not enrollment:
        enrollment = Enrollment(
            user_id=fellow_user.id,
            cohort_id=cohort.id,
            enrollment_status=EnrollmentStatus.ACTIVE,
        )
        db.add(enrollment)
        db.commit()
        db.refresh(enrollment)

    return {"program": program, "cohort": cohort, "phase": phase, "enrollment": enrollment}


def test_fellow_context_success(student_client: TestClient, fellow_user: User, setup_fellow_cohort):
    token = create_access_token(subject=str(fellow_user.id), role=fellow_user.role.value)
    headers = {"Authorization": f"Bearer {token}"}

    res = student_client.get("/api/v1/fellow/context", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["fellow"]["email"] == fellow_user.email
    assert data["program"]["code"] == "DLIF"
    assert data["cohort"]["code"] == "2026-A"
    assert data["current_phase"]["code"] == "DISCOVER"
    assert data["current_phase"]["development_role"] == "THINK"


def test_fellow_context_rejected_for_mentor(student_client: TestClient, mentor_user: User):
    token = create_access_token(subject=str(mentor_user.id), role=mentor_user.role.value)
    headers = {"Authorization": f"Bearer {token}"}

    res = student_client.get("/api/v1/fellow/context", headers=headers)
    assert res.status_code == 403


def test_fellow_context_unauthenticated(student_client: TestClient):
    res = student_client.get("/api/v1/fellow/context")
    assert res.status_code == 401


def test_discover_overview(student_client: TestClient, fellow_user: User, setup_fellow_cohort):
    token = create_access_token(subject=str(fellow_user.id), role=fellow_user.role.value)
    headers = {"Authorization": f"Bearer {token}"}

    res = student_client.get("/api/v1/fellow/discover/overview", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["phase"]["code"] == "DISCOVER"
    assert data["cohort"]["code"] == "2026-A"
    assert "progress" in data
    assert data["progress"]["total_weeks"] == 4
    assert data["progress"]["total_sessions"] >= 12
    assert "next_session" in data


def test_discover_weeks_ordering(student_client: TestClient, fellow_user: User, setup_fellow_cohort):
    token = create_access_token(subject=str(fellow_user.id), role=fellow_user.role.value)
    headers = {"Authorization": f"Bearer {token}"}

    res = student_client.get("/api/v1/fellow/discover/weeks", headers=headers)
    assert res.status_code == 200
    weeks = res.json()
    assert len(weeks) == 4
    # Check strict sequential ordering
    assert [w["week_number"] for w in weeks] == [1, 2, 3, 4]
    assert weeks[0]["title"] == "DISCOVER THE REAL PROBLEM"
    assert weeks[1]["title"] == "CREATE STRATEGIC POSSIBILITIES"
    assert weeks[2]["title"] == "DESIGN THE STRATEGY"
    assert weeks[3]["title"] == "BUILD THE CASE FOR ACTION"


def test_cross_cohort_session_isolation(db: Session, student_client: TestClient, fellow_user: User, setup_fellow_cohort):
    # Create another separate cohort and a session belonging to it
    other_cohort = Cohort(
        program_id=setup_fellow_cohort["program"].id,
        name="Cohort 2027-B",
        code=f"2027-B-{uuid4().hex[:4]}",
        status=CohortStatus.ACTIVE,
    )
    db.add(other_cohort)
    db.commit()
    db.refresh(other_cohort)

    other_session = DBSession(
        cohort_id=other_cohort.id,
        phase_id=setup_fellow_cohort["phase"].id,
        session_number=99,
        session_type=SessionType.LEARN_WORK,
        title="Secret Other Cohort Session",
        start_at=datetime.now(timezone.utc),
        end_at=datetime.now(timezone.utc) + timedelta(hours=1),
        sequence=99,
    )
    db.add(other_session)
    db.commit()
    db.refresh(other_session)

    token = create_access_token(subject=str(fellow_user.id), role=fellow_user.role.value)
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt to retrieve other cohort's session -> must be rejected with HTTP 403 Forbidden
    res = student_client.get(f"/api/v1/fellow/sessions/{other_session.id}", headers=headers)
    assert res.status_code == 403

    # Cleanup
    db.delete(other_session)
    db.delete(other_cohort)
    db.commit()
