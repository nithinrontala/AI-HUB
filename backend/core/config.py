from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Learning Hub API"
    MONGODB_URL: str = "mongodb://localhost:27017/"
    DATABASE_NAME: str = "ai_learning_hub"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    HF_API_TOKEN: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
