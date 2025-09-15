from pydantic import BaseSettings, Field, validator
from typing import Optional, List
import os
from pathlib import Path


class DatabaseSettings(BaseSettings):
    """Database configuration settings"""
    url: str = Field(
        default="postgresql://postgres:password@localhost:5432/renewmart",
        env="DATABASE_URL",
        description="Database connection URL"
    )
    echo: bool = Field(
        default=False,
        env="DATABASE_ECHO",
        description="Enable SQLAlchemy query logging"
    )
    pool_size: int = Field(
        default=10,
        env="DATABASE_POOL_SIZE",
        description="Database connection pool size"
    )
    max_overflow: int = Field(
        default=20,
        env="DATABASE_MAX_OVERFLOW",
        description="Maximum database connection overflow"
    )

    class Config:
        env_prefix = "DATABASE_"


class SecuritySettings(BaseSettings):
    """Security and authentication settings"""
    secret_key: str = Field(
        default="your-secret-key-change-this-in-production",
        env="SECRET_KEY",
        description="JWT secret key"
    )
    algorithm: str = Field(
        default="HS256",
        env="JWT_ALGORITHM",
        description="JWT algorithm"
    )
    access_token_expire_minutes: int = Field(
        default=30,
        env="ACCESS_TOKEN_EXPIRE_MINUTES",
        description="Access token expiration time in minutes"
    )
    refresh_token_expire_days: int = Field(
        default=7,
        env="REFRESH_TOKEN_EXPIRE_DAYS",
        description="Refresh token expiration time in days"
    )
    password_min_length: int = Field(
        default=8,
        env="PASSWORD_MIN_LENGTH",
        description="Minimum password length"
    )

    @validator('secret_key')
    def validate_secret_key(cls, v):
        if len(v) < 32:
            raise ValueError('Secret key must be at least 32 characters long')
        return v

    class Config:
        env_prefix = "SECURITY_"


class ServerSettings(BaseSettings):
    """Server configuration settings"""
    host: str = Field(
        default="0.0.0.0",
        env="HOST",
        description="Server host"
    )
    port: int = Field(
        default=8000,
        env="PORT",
        description="Server port"
    )
    reload: bool = Field(
        default=False,
        env="RELOAD",
        description="Enable auto-reload in development"
    )
    workers: int = Field(
        default=1,
        env="WORKERS",
        description="Number of worker processes"
    )
    log_level: str = Field(
        default="info",
        env="LOG_LEVEL",
        description="Logging level"
    )

    @validator('log_level')
    def validate_log_level(cls, v):
        valid_levels = ['debug', 'info', 'warning', 'error', 'critical']
        if v.lower() not in valid_levels:
            raise ValueError(f'Log level must be one of: {valid_levels}')
        return v.lower()

    class Config:
        env_prefix = "SERVER_"


class CORSSettings(BaseSettings):
    """CORS configuration settings"""
    allow_origins: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:4028"],
        env="CORS_ALLOW_ORIGINS",
        description="Allowed CORS origins"
    )
    allow_credentials: bool = Field(
        default=True,
        env="CORS_ALLOW_CREDENTIALS",
        description="Allow credentials in CORS requests"
    )
    allow_methods: List[str] = Field(
        default=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        env="CORS_ALLOW_METHODS",
        description="Allowed HTTP methods"
    )
    allow_headers: List[str] = Field(
        default=["*"],
        env="CORS_ALLOW_HEADERS",
        description="Allowed headers"
    )

    class Config:
        env_prefix = "CORS_"


class LoggingSettings(BaseSettings):
    """Logging configuration settings"""
    level: str = Field(
        default="INFO",
        env="LOG_LEVEL",
        description="Default logging level"
    )
    format: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        env="LOG_FORMAT",
        description="Log message format"
    )
    file_path: str = Field(
        default="logs",
        env="LOG_FILE_PATH",
        description="Log files directory path"
    )
    max_file_size: int = Field(
        default=10485760,  # 10MB
        env="LOG_MAX_FILE_SIZE",
        description="Maximum log file size in bytes"
    )
    backup_count: int = Field(
        default=5,
        env="LOG_BACKUP_COUNT",
        description="Number of backup log files to keep"
    )
    enable_access_log: bool = Field(
        default=True,
        env="LOG_ENABLE_ACCESS",
        description="Enable access logging"
    )
    enable_error_log: bool = Field(
        default=True,
        env="LOG_ENABLE_ERROR",
        description="Enable error logging"
    )

    @validator('level')
    def validate_level(cls, v):
        valid_levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']
        if v.upper() not in valid_levels:
            raise ValueError(f'Log level must be one of: {valid_levels}')
        return v.upper()

    class Config:
        env_prefix = "LOG_"


class FileUploadSettings(BaseSettings):
    """File upload configuration settings"""
    max_file_size: int = Field(
        default=10485760,  # 10MB
        env="UPLOAD_MAX_FILE_SIZE",
        description="Maximum file upload size in bytes"
    )
    allowed_extensions: List[str] = Field(
        default=[".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".gif"],
        env="UPLOAD_ALLOWED_EXTENSIONS",
        description="Allowed file extensions"
    )
    upload_path: str = Field(
        default="uploads",
        env="UPLOAD_PATH",
        description="File upload directory path"
    )

    class Config:
        env_prefix = "UPLOAD_"


class AppSettings(BaseSettings):
    """Main application settings"""
    app_name: str = Field(
        default="RenewMart API",
        env="APP_NAME",
        description="Application name"
    )
    version: str = Field(
        default="1.0.0",
        env="APP_VERSION",
        description="Application version"
    )
    description: str = Field(
        default="RenewMart - Renewable Energy Land Management Platform",
        env="APP_DESCRIPTION",
        description="Application description"
    )
    environment: str = Field(
        default="development",
        env="ENVIRONMENT",
        description="Application environment"
    )
    debug: bool = Field(
        default=True,
        env="DEBUG",
        description="Enable debug mode"
    )
    api_prefix: str = Field(
        default="/api",
        env="API_PREFIX",
        description="API route prefix"
    )

    @validator('environment')
    def validate_environment(cls, v):
        valid_envs = ['development', 'staging', 'production']
        if v.lower() not in valid_envs:
            raise ValueError(f'Environment must be one of: {valid_envs}')
        return v.lower()

    class Config:
        env_prefix = "APP_"


class Settings(BaseSettings):
    """Combined application settings"""
    app: AppSettings = AppSettings()
    database: DatabaseSettings = DatabaseSettings()
    security: SecuritySettings = SecuritySettings()
    server: ServerSettings = ServerSettings()
    cors: CORSSettings = CORSSettings()
    logging: LoggingSettings = LoggingSettings()
    upload: FileUploadSettings = FileUploadSettings()

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Ensure upload and log directories exist
        Path(self.upload.upload_path).mkdir(parents=True, exist_ok=True)
        Path(self.logging.file_path).mkdir(parents=True, exist_ok=True)


# Global settings instance
settings = Settings()


# Convenience functions
def get_settings() -> Settings:
    """Get application settings instance"""
    return settings


def get_database_url() -> str:
    """Get database connection URL"""
    return settings.database.url


def is_development() -> bool:
    """Check if running in development environment"""
    return settings.app.environment == "development"


def is_production() -> bool:
    """Check if running in production environment"""
    return settings.app.environment == "production"