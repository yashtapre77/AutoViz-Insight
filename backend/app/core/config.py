from pydantic_settings import BaseSettings
from pydantic import AnyUrl


class Settings(BaseSettings):
    APP_NAME: str = "Auto-Viz"
    API_STARTING_PATH: str = "/api"

    # Database
    DATABASE_URL: str

    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14

    # Security
    BCRYPT_ROUNDS: int = 12


    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()