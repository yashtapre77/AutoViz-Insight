from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import settings


engine = create_async_engine(settings.DATABASE_URL)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    class_=AsyncSession,
    bind=engine,
)

async def get_db():
    session = SessionLocal()
    try:
        yield session
    finally:
        await session.close()


class Base(DeclarativeBase):
    pass