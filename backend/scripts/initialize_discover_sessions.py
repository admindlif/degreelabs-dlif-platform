"""Create or synchronize canonical DISCOVER Sessions for one Cohort."""

import argparse
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.cohort import Cohort
from app.services.discover_initialization import (
    initialize_discover_sessions_for_cohort,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Create missing canonical DISCOVER Sessions 0-12 and synchronize "
            "their curriculum metadata without changing operational fields."
        )
    )
    parser.add_argument(
        "--cohort-code",
        required=True,
        help="Exact code of the existing Cohort to initialize.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    db = SessionLocal()
    try:
        cohort = db.scalars(
            select(Cohort).where(Cohort.code == args.cohort_code)
        ).first()
        if not cohort:
            raise RuntimeError(
                f"Cohort with code '{args.cohort_code}' was not found."
            )

        result = initialize_discover_sessions_for_cohort(db, cohort)
        db.commit()

        print(
            f"Initialized Cohort {cohort.name} ({cohort.code}). "
            f"CREATED: {list(result.created_session_numbers)}; "
            f"SYNCED: {list(result.synced_session_numbers)}; "
            f"UNCHANGED: {list(result.unchanged_session_numbers)}."
        )
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
