"""
Seed script for DLIF DISCOVER curriculum and active cohort.

Idempotent: safe to run multiple times without duplicating data.
"""

import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import select
from app.db.session import SessionLocal
from app.models.cohort import Cohort
from app.models.phase import Phase
from app.models.program import Program
from app.models.resource import Resource, ResourceType
from app.models.session import Session, SessionStatus, SessionType
from app.models.week import Week


def seed_dlif():
    db = SessionLocal()
    try:
        print("[SEED] Seeding DLIF Program, Cohort, Phase, Weeks, and Sessions...")

        # 1. Program
        program = db.scalars(select(Program).where(Program.code == "DLIF")).first()
        if not program:
            program = Program(
                name="DegreeLabs Impact Fellowship",
                code="DLIF",
                description=None,
                is_active=True,
            )
            db.add(program)
            db.flush()
            print(f"  + Created Program: {program.name} ({program.code})")
        else:
            program.name = "DegreeLabs Impact Fellowship"
            program.description = None
            print(f"  * Existing Program: {program.name}")

        # 2. Target existing Cohort
        target_cohort_code = os.getenv(
            "DLIF_SEED_COHORT_CODE",
            "BATCH01",
        )

        cohort = db.scalars(
            select(Cohort).where(
                Cohort.program_id == program.id,
                Cohort.code == target_cohort_code,
            )
        ).first()

        if not cohort:
            raise RuntimeError(
                "Target DLIF Cohort does not exist: "
                f"{target_cohort_code}. "
                "Create the Cohort in Admin first or set "
                "DLIF_SEED_COHORT_CODE."
            )

        print(
            f"  * Target Cohort: "
            f"{cohort.name} ({cohort.code})"
        )

        # 3. Phase: DISCOVER (THINK)
        phase = db.scalars(
            select(Phase).where(Phase.program_id == program.id, Phase.code == "DISCOVER")
        ).first()
        if not phase:
            phase = Phase(
                program_id=program.id,
                code="DISCOVER",
                name="DISCOVER",
                development_role="THINK",
                sequence=1,
                duration_weeks=4,
                description="A 4-week strategic problem-solving apprenticeship.",
                is_active=True,
            )
            db.add(phase)
            db.flush()
            print(f"  + Created Phase: {phase.name} ({phase.development_role})")
        else:
            phase.name = "DISCOVER"
            phase.development_role = "THINK"
            phase.sequence = 1
            phase.duration_weeks = 4
            phase.description = (
                "A 4-week strategic problem-solving apprenticeship."
            )
            print(f"  * Existing Phase: {phase.name}")

        # 4. Weeks 1 to 4
        weeks_spec = [
            {
                "week_number": 1,
                "sequence": 1,
                "title": "DISCOVER THE REAL PROBLEM",
                "strategic_question": "What is really happening here?",
                "description": (
                    "Build enough business context and evidence to define the "
                    "problem that deserves attention."
                ),
            },
            {
                "week_number": 2,
                "sequence": 2,
                "title": "CREATE STRATEGIC POSSIBILITIES",
                "strategic_question": "What could we choose to do?",
                "description": (
                    "Prevent idea fixation. Your team must create materially "
                    "different strategic possibilities, surface the assumptions "
                    "behind each, test the most important barriers and earn the "
                    "right to choose."
                ),
            },
            {
                "week_number": 3,
                "sequence": 3,
                "title": "DESIGN THE STRATEGY",
                "strategic_question": (
                    "If this is our choice, how will it actually work?"
                ),
                "description": (
                    "Convert the selected possibility into an integrated strategy "
                    "and an execution architecture credible enough to survive "
                    "contact with the company’s real constraints."
                ),
            },
            {
                "week_number": 4,
                "sequence": 4,
                "title": "BUILD THE CASE FOR ACTION",
                "strategic_question": "Why should the company believe us?",
                "description": None,
            },
        ]

        weeks_map: dict[int, Week] = {}
        for w_spec in weeks_spec:
            week = db.scalars(
                select(Week).where(
                    Week.phase_id == phase.id,
                    Week.week_number == w_spec["week_number"],
                )
            ).first()
            if not week:
                week = Week(
                    phase_id=phase.id,
                    week_number=w_spec["week_number"],
                    sequence=w_spec["sequence"],
                    title=w_spec["title"],
                    strategic_question=w_spec["strategic_question"],
                    description=w_spec["description"],
                )
                db.add(week)
                db.flush()
                print(f"  + Created Week {week.week_number}: {week.title}")
            else:
                week.sequence = w_spec["sequence"]
                week.title = w_spec["title"]
                week.strategic_question = w_spec["strategic_question"]
                week.description = w_spec["description"]
                print(f"  * Existing Week {week.week_number}: {week.title}")
            weeks_map[week.week_number] = week

        # 5. Sessions 0 to 12
        sessions_spec = [
            # Week 1
            {
                "session_number": 0,
                "session_type": SessionType.INDUCTION,
                "title": "Induction",
                "description": None,
                "sequence": 0,
                "week_number": None,
                "status": SessionStatus.SCHEDULED,
                "start_at": None,
                "end_at": None,
                "recording_url": None,
                "meeting_url": None,
                "transcript_url": None,
            },
            {
                "session_number": 1,
                "session_type": SessionType.LEARN_WORK,
                "title": "Business Context & Evidence",
                "description": None,
                "sequence": 1,
                "week_number": 1,
                "status": SessionStatus.SCHEDULED,
                "start_at": None,
                "end_at": None,
                "recording_url": None,
                "meeting_url": None,
                "transcript_url": None,
            },
            {
                "session_number": 2,
                "session_type": SessionType.LEARN_WORK,
                "title": "Problem Framing & Diagnosis",
                "description": None,
                "sequence": 2,
                "week_number": 1,
                "status": SessionStatus.SCHEDULED,
                "start_at": None,
                "end_at": None,
                "recording_url": None,
                "meeting_url": None,
                "transcript_url": None,
            },
            {
                "session_number": 3,
                "session_type": SessionType.OUTPUT_REVIEW,
                "title": "Discovery Review",
                "description": None,
                "sequence": 3,
                "week_number": 1,
                "status": SessionStatus.SCHEDULED,
                "start_at": None,
                "end_at": None,
                "recording_url": None,
                "meeting_url": None,
                "transcript_url": None,
            },
            # Week 2
            {
                "session_number": 4,
                "session_type": SessionType.LEARN_WORK,
                "title": "Research & Possibility Generation",
                "description": None,
                "sequence": 4,
                "week_number": 2,
                "status": SessionStatus.SCHEDULED,
                "start_at": None,
                "end_at": None,
                "recording_url": None,
                "meeting_url": None,
                "transcript_url": None,
            },
            {
                "session_number": 5,
                "session_type": SessionType.LEARN_WORK,
                "title": "What Would Have to Be True?",
                "description": None,
                "sequence": 5,
                "week_number": 2,
                "status": SessionStatus.SCHEDULED,
                "start_at": None,
                "end_at": None,
                "recording_url": None,
                "meeting_url": None,
                "transcript_url": None,
            },
            {
                "session_number": 6,
                "session_type": SessionType.OUTPUT_REVIEW,
                "title": "Strategic Choice Review",
                "description": None,
                "sequence": 6,
                "week_number": 2,
                "status": SessionStatus.SCHEDULED,
                "start_at": None,
                "end_at": None,
                "recording_url": None,
                "meeting_url": None,
                "transcript_url": None,
            },
            # Week 3
            {
                "session_number": 7,
                "session_type": SessionType.LEARN_WORK,
                "title": "Integrated Strategy Choices",
                "description": None,
                "sequence": 7,
                "week_number": 3,
                "status": SessionStatus.SCHEDULED,
                "start_at": None,
                "end_at": None,
                "recording_url": None,
                "meeting_url": None,
                "transcript_url": None,
            },
            {
                "session_number": 8,
                "session_type": SessionType.LEARN_WORK,
                "title": "Execution Architecture",
                "description": None,
                "sequence": 8,
                "week_number": 3,
                "status": SessionStatus.SCHEDULED,
                "start_at": None,
                "end_at": None,
                "recording_url": None,
                "meeting_url": None,
                "transcript_url": None,
            },
            {
                "session_number": 9,
                "session_type": SessionType.OUTPUT_REVIEW,
                "title": "Strategy Review",
                "description": None,
                "sequence": 9,
                "week_number": 3,
                "status": SessionStatus.SCHEDULED,
                "start_at": None,
                "end_at": None,
                "recording_url": None,
                "meeting_url": None,
                "transcript_url": None,
            },
            # Week 4
            {
                "session_number": 10,
                "session_type": SessionType.LEARN_WORK,
                "title": "Proposal Architecture",
                "description": None,
                "sequence": 10,
                "week_number": 4,
                "status": SessionStatus.SCHEDULED,
                "start_at": None,
                "end_at": None,
                "recording_url": None,
                "meeting_url": None,
                "transcript_url": None,
            },
            {
                "session_number": 11,
                "session_type": SessionType.LEARN_WORK,
                "title": "Executive Communication",
                "description": None,
                "sequence": 11,
                "week_number": 4,
                "status": SessionStatus.SCHEDULED,
                "start_at": None,
                "end_at": None,
                "recording_url": None,
                "meeting_url": None,
                "transcript_url": None,
            },
            {
                "session_number": 12,
                "session_type": SessionType.OUTPUT_REVIEW,
                "title": "Final DISCOVER Review",
                "description": None,
                "sequence": 12,
                "week_number": 4,
                "status": SessionStatus.SCHEDULED,
                "start_at": None,
                "end_at": None,
                "recording_url": None,
                "meeting_url": None,
                "transcript_url": None,
            },
        ]

        for s_spec in sessions_spec:
            session = db.scalars(
                select(Session).where(
                    Session.cohort_id == cohort.id,
                    Session.session_number == s_spec["session_number"],
                )
            ).first()
            target_week = (
                weeks_map.get(s_spec["week_number"])
                if s_spec["week_number"] is not None
                else None
            )
            if not session:
                session = Session(
                    cohort_id=cohort.id,
                    phase_id=phase.id,
                    week_id=target_week.id if target_week else None,
                    is_unlocked=(
                        s_spec["session_number"] <= 2
                    ),
                    unlock_at=None,
                    submission_enabled=False,
                    session_number=s_spec["session_number"],
                    session_type=s_spec["session_type"],
                    title=s_spec["title"],
                    description=s_spec["description"],
                    start_at=s_spec["start_at"],
                    end_at=s_spec["end_at"],
                    status=s_spec["status"],
                    meeting_url=s_spec["meeting_url"],
                    recording_url=s_spec["recording_url"],
                    transcript_url=s_spec["transcript_url"],
                    sequence=s_spec["sequence"],
                )
                db.add(session)
                print(f"  + Created Session {session.session_number}: {session.title}")
            else:
                # Keep existing seeded Sessions aligned with the
                # canonical DISCOVER curriculum structure.
                session.phase_id = phase.id

                session.week_id = (
                    target_week.id
                    if target_week
                    else None
                )

                session.title = s_spec["title"]
                session.description = s_spec["description"]
                session.session_type = s_spec["session_type"]

                # Preserve operational Session data entered by Admin:
                # dates, status, Meet/recording/transcript URLs, lock state,
                # submission state, and Google Calendar/Meet metadata must not
                # be overwritten by reseeding.

                session.sequence = s_spec["sequence"]

                print(
                    f"  * Synced Session "
                    f"{session.session_number}: "
                    f"{session.title}"
                )

        # 6. Seed DISCOVER Phase Resources
        resources_spec = [
            {
                "title": "DLIF Fellow Handbook — DISCOVER (v1.0, Sept 2026)",
                "subtitle": "PDF \u2022 v1.0 (Sept 2026)",
                "resource_type": ResourceType.HANDBOOK,
                "url": None,
                "is_downloadable": True,
                "sequence": 1,
            },
            {
                "title": "Problem Rubric & Guidelines",
                "subtitle": None,
                "resource_type": ResourceType.RUBRIC,
                "url": None,
                "is_downloadable": False,
                "sequence": 2,
            },
        ]

        for r_spec in resources_spec:
            existing_resource = db.scalars(
                select(Resource).where(
                    Resource.phase_id == phase.id,
                    Resource.title == r_spec["title"],
                )
            ).first()
            if not existing_resource:
                resource = Resource(
                    phase_id=phase.id,
                    title=r_spec["title"],
                    subtitle=r_spec["subtitle"],
                    resource_type=r_spec["resource_type"],
                    url=r_spec["url"],
                    is_downloadable=r_spec["is_downloadable"],
                    is_active=True,
                    sequence=r_spec["sequence"],
                )
                db.add(resource)
                print(f"  + Created Resource: {resource.title}")
            else:
                existing_resource.subtitle = r_spec["subtitle"]
                existing_resource.resource_type = r_spec["resource_type"]
                existing_resource.is_downloadable = r_spec["is_downloadable"]
                existing_resource.sequence = r_spec["sequence"]
                print(f"  * Existing Resource: {existing_resource.title}")

        db.commit()
        print("[SUCCESS] DLIF seed complete!")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding DLIF: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_dlif()
