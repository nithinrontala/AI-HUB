from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Learning Hub API"
    MONGODB_URL: str = "mongodb://localhost:27017/"
    DATABASE_NAME: str = "ai_learning_hub"

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
