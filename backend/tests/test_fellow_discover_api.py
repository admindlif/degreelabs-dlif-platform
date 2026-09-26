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

            # ---------------------------------------------------------
    # Create the four DISCOVER weeks
    # ---------------------------------------------------------
    week_specs = [
        (1, "DISCOVER THE REAL PROBLEM"),
        (2, "CREATE STRATEGIC POSSIBILITIES"),
        (3, "DESIGN THE STRATEGY"),
        (4, "BUILD THE CASE FOR ACTION"),
    ]

    weeks: dict[int, Week] = {}

    for week_number, title in week_specs:
        week = (
            db.query(Week)
            .filter(
                Week.phase_id == phase.id,
                Week.week_number == week_number,
            )
            .first()
        )

        if not week:
            week = Week(
                phase_id=phase.id,
                week_number=week_number,
                title=title,
                sequence=week_number,
            )
            db.add(week)
            db.flush()
        else:
            # Keep test data deterministic
            week.title = title
            week.sequence = week_number

        weeks[week_number] = week

    db.commit()

    # ---------------------------------------------------------
    # Create Session 0 + 12 DISCOVER sessions
    # ---------------------------------------------------------
    existing_sessions = (
        db.query(DBSession)
        .filter(
            DBSession.cohort_id == cohort.id,
            DBSession.phase_id == phase.id,
        )
        .all()

    
    )

    # Keep Session access state deterministic for every test run.
    for existing_session in existing_sessions:
        existing_session.is_unlocked = (
            existing_session.session_number <= 2
        )

        existing_session.unlock_at = (
            datetime.now(timezone.utc)
            if existing_session.session_number <= 2
            else None
        )

    db.flush()

    existing_numbers = {
        session.session_number
        for session in existing_sessions
    }

    base_time = datetime.now(timezone.utc) + timedelta(days=1)

    # Session 0 - induction
    if 0 not in existing_numbers:
        induction = DBSession(
            cohort_id=cohort.id,
            phase_id=phase.id,
            week_id=None,
            session_number=0,
            session_type=SessionType.INDUCTION,
            title="Session 0 - Induction",
            start_at=base_time,
            end_at=base_time + timedelta(hours=1),
            status=SessionStatus.SCHEDULED,
            sequence=0,
            is_unlocked=True,
            unlock_at=datetime.now(timezone.utc),
        )

        db.add(induction)

    # Sessions 1-12
    for session_number in range(1, 13):
        if session_number in existing_numbers:
            continue

        week_number = ((session_number - 1) // 3) + 1
        week = weeks[week_number]

        start_at = base_time + timedelta(days=session_number)

        session = DBSession(
            cohort_id=cohort.id,
            phase_id=phase.id,
            week_id=week.id,
            session_number=session_number,
            session_type=(
                SessionType.OUTPUT_REVIEW
                if session_number % 3 == 0
                else SessionType.LEARN_WORK
            ),
            title=f"Session {session_number}",
            start_at=start_at,
            end_at=start_at + timedelta(hours=1),
            status=SessionStatus.SCHEDULED,
            sequence=session_number,
            is_unlocked=(session_number <= 2),
            unlock_at=(
                datetime.now(timezone.utc)
                if session_number <= 2
                else None
            ),  
        )

        db.add(session)

    db.commit()

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

def test_locked_session_is_hidden_in_fellow_week_response(
    db: Session,
    student_client: TestClient,
    fellow_user: User,
    setup_fellow_cohort,
):
    cohort = setup_fellow_cohort["cohort"]

    session = (
        db.query(DBSession)
        .filter(
            DBSession.cohort_id == cohort.id,
            DBSession.session_number == 3,
        )
        .one()
    )

    # Add protected data which must not leak.
    session.title = "SECRET SESSION 3 TITLE"
    session.description = "SECRET DESCRIPTION"
    session.meeting_url = (
        "https://meet.google.com/secret-session-3"
    )
    session.recording_url = (
        "https://drive.google.com/secret-recording"
    )
    session.transcript_url = (
        "https://drive.google.com/secret-transcript"
    )
    session.submission_enabled = True

    session.is_unlocked = False
    session.unlock_at = None

    db.commit()

    token = create_access_token(
        subject=str(fellow_user.id),
        role=fellow_user.role.value,
    )

    headers = {
        "Authorization": f"Bearer {token}"
    }

    response = student_client.get(
        "/api/v1/fellow/discover/weeks",
        headers=headers,
    )

    assert response.status_code == 200

    weeks = response.json()

    all_sessions = [
        item
        for week in weeks
        for item in week["sessions"]
    ]

    session_3 = next(
        item
        for item in all_sessions
        if item["session_number"] == 3
    )

    assert session_3["is_unlocked"] is False
    assert session_3["status"] == "locked"

    assert session_3["title"] == "Session 3"
    assert session_3["description"] is None

    assert session_3["start_at"] is None
    assert session_3["end_at"] is None

    assert session_3["meeting_url"] is None
    assert session_3["recording_url"] is None
    assert session_3["transcript_url"] is None

    assert session_3["submission_enabled"] is False

    assert session_3["has_recording"] is False
    assert session_3["has_transcript"] is False

def test_locked_session_direct_access_is_forbidden(
    db: Session,
    student_client: TestClient,
    fellow_user: User,
    setup_fellow_cohort,
):
    cohort = setup_fellow_cohort["cohort"]

    session = (
        db.query(DBSession)
        .filter(
            DBSession.cohort_id == cohort.id,
            DBSession.session_number == 3,
        )
        .one()
    )

    session.is_unlocked = False
    session.unlock_at = None

    db.commit()

    token = create_access_token(
        subject=str(fellow_user.id),
        role=fellow_user.role.value,
    )

    headers = {
        "Authorization": f"Bearer {token}"
    }

    response = student_client.get(
        f"/api/v1/fellow/sessions/{session.id}",
        headers=headers,
    )

    assert response.status_code == 403

    assert (
        "locked"
        in response.json()["detail"].lower()
    )

def test_unlocked_session_content_is_available(
    db: Session,
    student_client: TestClient,
    fellow_user: User,
    setup_fellow_cohort,
):
    cohort = setup_fellow_cohort["cohort"]

    session = (
        db.query(DBSession)
        .filter(
            DBSession.cohort_id == cohort.id,
            DBSession.session_number == 3,
        )
        .one()
    )

    session.title = "Discovery Review"
    session.description = "Session 3 description"

    session.meeting_url = (
        "https://meet.google.com/session-3"
    )

    session.recording_url = (
        "https://drive.google.com/session-3-recording"
    )

    session.transcript_url = (
        "https://drive.google.com/session-3-transcript"
    )

    session.submission_enabled = True

    # Simulate Admin unlock.
    session.is_unlocked = True
    session.unlock_at = datetime.now(
        timezone.utc
    )

    db.commit()

    token = create_access_token(
        subject=str(fellow_user.id),
        role=fellow_user.role.value,
    )

    headers = {
        "Authorization": f"Bearer {token}"
    }

    response = student_client.get(
        f"/api/v1/fellow/sessions/{session.id}",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["session_number"] == 3
    assert data["is_unlocked"] is True

    assert data["title"] == "Discovery Review"

    assert (
        data["meeting_url"]
        == "https://meet.google.com/session-3"
    )

    assert (
        data["recording_url"]
        == "https://drive.google.com/session-3-recording"
    )

    assert (
        data["transcript_url"]
        == "https://drive.google.com/session-3-transcript"
    )

    assert data["submission_enabled"] is True
    assert data["has_recording"] is True
    assert data["has_transcript"] is True

def test_new_fellow_in_cohort_receives_existing_cohort_sessions(
    db: Session,
    student_client: TestClient,
    setup_fellow_cohort,
):
    """
    A Fellow enrolled after Sessions already exist must
    automatically receive all Sessions for that Cohort.
    No per-Session assignment is required.
    """
    cohort = setup_fellow_cohort["cohort"]
    phase = setup_fellow_cohort["phase"]

    new_fellow = User(
        first_name="New",
        last_name="Fellow",
        email=f"new_fellow_{uuid4().hex[:8]}@degreelabs.com",
        password_hash=hash_password("Pass12345!"),
        role=UserRole.FELLOW,
        account_status=AccountStatus.ACTIVE,
        is_active=True,
    )

    db.add(new_fellow)
    db.flush()

    enrollment = Enrollment(
        user_id=new_fellow.id,
        cohort_id=cohort.id,
        enrollment_status=EnrollmentStatus.ACTIVE,
    )

    db.add(enrollment)
    db.commit()
    db.refresh(new_fellow)

    expected_sessions = (
        db.query(DBSession)
        .filter(
            DBSession.cohort_id == cohort.id,
            DBSession.phase_id == phase.id,
        )
        .all()
    )

    expected_ids = {
        str(session.id)
        for session in expected_sessions
    }

    token = create_access_token(
        subject=str(new_fellow.id),
        role=new_fellow.role.value,
    )

    headers = {
        "Authorization": f"Bearer {token}"
    }

    response = student_client.get(
        "/api/v1/fellow/discover/weeks",
        headers=headers,
    )

    assert response.status_code == 200

    weeks = response.json()

    received_ids = {
        session["id"]
        for week in weeks
        for session in week["sessions"]
    }

    assert received_ids == expected_ids

    # Cleanup
    db.delete(enrollment)
    db.delete(new_fellow)
    db.commit()

def test_fellow_only_receives_sessions_from_active_cohort(
    db: Session,
    student_client: TestClient,
    setup_fellow_cohort,
):
    """
    Sessions belonging to Cohort A must never appear
    in the Session list of a Fellow enrolled in Cohort B.
    """
    program = setup_fellow_cohort["program"]
    phase = setup_fellow_cohort["phase"]

    other_cohort = Cohort(
        program_id=program.id,
        name="DLIF Cohort Isolation Test",
        code=f"TEST-{uuid4().hex[:8]}",
        status=CohortStatus.ACTIVE,
    )

    db.add(other_cohort)
    db.flush()

    other_fellow = User(
        first_name="Other",
        last_name="Fellow",
        email=f"other_fellow_{uuid4().hex[:8]}@degreelabs.com",
        password_hash=hash_password("Pass12345!"),
        role=UserRole.FELLOW,
        account_status=AccountStatus.ACTIVE,
        is_active=True,
    )

    db.add(other_fellow)
    db.flush()

    other_enrollment = Enrollment(
        user_id=other_fellow.id,
        cohort_id=other_cohort.id,
        enrollment_status=EnrollmentStatus.ACTIVE,
    )

    db.add(other_enrollment)

    week_1 = (
        db.query(Week)
        .filter(
            Week.phase_id == phase.id,
            Week.week_number == 1,
        )
        .one()
    )

    other_session = DBSession(
        cohort_id=other_cohort.id,
        phase_id=phase.id,
        week_id=week_1.id,
        session_number=1,
        session_type=SessionType.LEARN_WORK,
        title="Cohort B Session",
        start_at=datetime.now(timezone.utc),
        end_at=(
            datetime.now(timezone.utc)
            + timedelta(hours=1)
        ),
        status=SessionStatus.SCHEDULED,
        sequence=1,
        is_unlocked=True,
        unlock_at=datetime.now(timezone.utc),
    )

    db.add(other_session)
    db.commit()

    cohort_a_session_ids = {
        str(session.id)
        for session in (
            db.query(DBSession)
            .filter(
                DBSession.cohort_id
                == setup_fellow_cohort["cohort"].id
            )
            .all()
        )
    }

    token = create_access_token(
        subject=str(other_fellow.id),
        role=other_fellow.role.value,
    )

    headers = {
        "Authorization": f"Bearer {token}"
    }

    response = student_client.get(
        "/api/v1/fellow/discover/weeks",
        headers=headers,
    )

    assert response.status_code == 200

    weeks = response.json()

    received_ids = {
        session["id"]
        for week in weeks
        for session in week["sessions"]
    }

    # Fellow B sees their own Cohort Session.
    assert str(other_session.id) in received_ids

    # Fellow B sees nothing from Cohort A.
    assert received_ids.isdisjoint(
        cohort_a_session_ids
    )

    # Cleanup
    db.delete(other_session)
    db.delete(other_enrollment)
    db.delete(other_fellow)
    db.delete(other_cohort)
    db.commit()
