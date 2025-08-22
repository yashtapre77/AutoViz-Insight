from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.core.security import decode_jwt
from fastapi import HTTPException, status


class UserServices:
    def __init__(self, db: AsyncSession):
        self.db = db


    async def get_by_email(self, email: str) -> User | None:
        res = await self.db.execute(select(User).where(User.email == email))
        return res.scalar_one_or_none()


    async def create(self, *, email: str, hashed_password: str, full_name: str | None) -> User:
        user = User(email=email, hashed_password=hashed_password, full_name=full_name)
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user


    async def get(self, user_id: int) -> User | None:
        res = await self.db.execute(select(User).where(User.id == user_id))
        return res.scalar_one_or_none()
    

    async def get_current_user(self, token: str):
        """
        Use in endpoints via a security scheme (e.g., OAuth2PasswordBearer) to pass the token.
        This function expects the raw token string.
        """
        payload = decode_jwt(token)
        if not payload or payload.get("type") != "access":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user_id = payload.get("sub")
        # repo = UserServices(self.db)
        user = await self.get(int(user_id))
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return user
