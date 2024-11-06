# app/core/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # API Configuration
    OPENROUTER_API_KEY: str
    LLM_MODEL: str

    # Interpreter Configuration
    INTERPRETER_AUTO_RUN: bool = False
    INTERPRETER_SAFE_MODE: str = "ask"
    
    # Application Configuration
    TEMPLATES_DIR: str = "app/templates"
    STATIC_DIR: str = "app/static"
    
    # Development Settings
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()