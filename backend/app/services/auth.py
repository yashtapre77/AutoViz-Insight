from sqlalchemy.orm import Session
from datetime import timedelta, datetime, timezone
from app.core.config import settings
from app.core.security import hash_password, verify_password, create_jwt_token
from app.services.user import UserServices
from app.services.token import TokenServices
from app.models.user import User


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.users = UserServices(db)
        self.tokens = TokenServices(db)


    async def register_user(self, *, email: str, password: str, full_name: str | None) -> User:
        existing = await self.users.get_by_email(email)
        if existing:
            raise ValueError("Email already registered")
        hpw = hash_password(password)
        user = await self.users.create(email=email, hashed_password=hpw, full_name=full_name)
        return user


    async def authenticate(self, *, email: str, password: str) -> tuple[str, str]:
        user = await self.users.get_by_email(email)
        if not user:
            raise ValueError("Invalid credentials")
        if not verify_password(password, user.hashed_password):
            raise ValueError("Invalid credentials")
        access = create_jwt_token(
            subject=str(user.id),
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
            token_type="access",
        )
        refresh_exp = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        refresh = create_jwt_token(
            subject=str(user.id),
            expires_delta=refresh_exp,
            token_type="refresh",
        )
        # Persist refresh for revocation capability
        await self.tokens.store_refresh(
            user_id=user.id,
            token=refresh,
            expires_at=datetime.now(timezone.utc) + refresh_exp,
        )
        return access, refresh


    async def refresh_tokens(self, *, refresh_token: str) -> tuple[str, str]:
        rec = await self.tokens.get_valid(refresh_token)
        if not rec:
            raise ValueError("Invalid refresh token")
        user_id = str(rec.user_id)
        access = create_jwt_token(
            subject=user_id,
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
            token_type="access",
        )
        refresh_exp = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        new_refresh = create_jwt_token(
            subject=user_id,
            expires_delta=refresh_exp,
            token_type="refresh",
        )
        # Rotate: revoke old, store new
        await self.tokens.revoke(refresh_token)
        await self.tokens.store_refresh(
            user_id=int(user_id),
            token=new_refresh,
            expires_at=datetime.now(timezone.utc) + refresh_exp,
        )
        return access, new_refresh