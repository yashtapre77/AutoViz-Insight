from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.user import UserOut, UserCreate
from app.schemas.auth import TokenPair, RefreshRequest
from app.services.auth_service import AuthService
from app.db.models.user import User 
from app.core.security import decode_jwt
from app.services.user_service import UserRepository
from app.services.token_service import TokenRepository

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


@router.post("/register", response_model=UserOut, status_code=201)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    try:
        user = await service.register_user(email=payload.email, password=payload.password, full_name=payload.full_name)
        await db.commit()
        return user
    except ValueError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    

@router.post("/login", response_model=TokenPair)
async def login(form: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    try:
        access, refresh = await service.authenticate(email=form.username, password=form.password)
        await db.commit()
        return TokenPair(access_token=access, refresh_token=refresh)
    except ValueError as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))




@router.post("/refresh", response_model=TokenPair)
async def refresh_tokens(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    try:
        access, refresh = await service.refresh_tokens(refresh_token=payload.refresh_token)
        await db.commit()
        return TokenPair(access_token=access, refresh_token=refresh)
    except ValueError as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    

@router.get("/me", response_model=UserOut)
async def read_me( token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db),):
    # Minimal inline validation to avoid circular deps; alternatively, use deps.get_current_user
    
    payload = decode_jwt(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token")

    repo = UserRepository(db)
    user = await repo.get(int(payload["sub"]))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user




@router.post("/logout", status_code=204)
async def logout(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
# Revoke the provided refresh token (stateless access tokens will expire on their own)

    repo = TokenRepository(db)
    await repo.revoke(payload.refresh_token)
    await db.commit()
    return