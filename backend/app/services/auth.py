from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.user import User, UserRole
from app.repositories.user import (
    create_user,
    get_user_by_email,
)
from app.schemas.auth import RegisterRequest


def register_student(
    db: Session,
    data: RegisterRequest,
) -> User:
    existing_user = get_user_by_email(
        db,
        str(data.email),
    )

    if existing_user:
        raise ValueError(
            "A user with this email already exists"
        )

    user = User(
        first_name=data.first_name.strip(),
        last_name=data.last_name.strip(),
        email=str(data.email).lower(),
        password_hash=hash_password(data.password),
        role=UserRole.STUDENT,
    )

    return create_user(db, user)


def authenticate_user(
    db: Session,
    email: str,
    password: str,
) -> User | None:
    user = get_user_by_email(
        db,
        email,
    )

    if user is None:
        return None

    if not user.is_active:
        return None

    if not verify_password(
        password,
        user.password_hash,
    ):
        return None

    return user


def generate_login_token(
    user: User,
) -> str:
    return create_access_token(
        subject=str(user.id)
    )