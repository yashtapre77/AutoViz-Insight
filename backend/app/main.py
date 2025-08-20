from fastapi import FastAPI
from app.core.config import settings
from app.api.v1.routes_auth import router as auth_router


app = FastAPI(title=settings.APP_NAME)


app.include_router(auth_router, prefix=settings.API_V1_STR)
