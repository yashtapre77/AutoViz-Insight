from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from app.models.token import RefreshToken
from fastapi import HTTPException


class TokenServices:
    def __init__(self, db: AsyncSession):
        self.db = db


    async def store_refresh(self, *, user_id: int, token: str, expires_at: datetime) -> RefreshToken:
        rec = RefreshToken(user_id=user_id, token=token, expires_at=expires_at)
        self.db.add(rec)
        await self.db.flush()
        await self.db.refresh(rec)
        return rec


    async def get_valid(self, token: str) -> RefreshToken | None:
        res = await self.db.execute(select(RefreshToken).where(RefreshToken.token == token))
        rec = res.scalar_one_or_none()
        if not rec:
            return None
        if rec.revoked:
            return None
        if rec.expires_at <= datetime.now(timezone.utc):
            return None
        return rec


    async def revoke(self, token: str):
        q = await self.db.execute(
            select(RefreshToken).where(RefreshToken.token == token)
        )
        db_token = q.scalar_one_or_none()
        if not db_token:
            raise HTTPException(status_code=404, detail="Token not found")

        db_token.revoked = True
        self.db.add(db_token)