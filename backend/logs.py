import logging
import logging.handlers
import os
from datetime import datetime
from pathlib import Path

# Create logs directory if it doesn't exist
logs_dir = Path("logs")
logs_dir.mkdir(exist_ok=True)

def setup_logging(log_level=logging.INFO):
    """
    Configure comprehensive logging for the RenewMart application.
    
    Args:
        log_level: Logging level (default: INFO)
    
    Returns:
        logger: Configured logger instance
    """
    
    # Create logger
    logger = logging.getLogger("renewmart")
    logger.setLevel(log_level)
    
    # Clear existing handlers to avoid duplicates
    logger.handlers.clear()
    
    # Create formatters
    detailed_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    simple_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%H:%M:%S'
    )
    
    # Console handler for development
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(simple_formatter)
    logger.addHandler(console_handler)
    
    # File handler for all logs
    file_handler = logging.handlers.RotatingFileHandler(
        logs_dir / "renewmart.log",
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(detailed_formatter)
    logger.addHandler(file_handler)
    
    # Error file handler for errors only
    error_handler = logging.handlers.RotatingFileHandler(
        logs_dir / "renewmart_errors.log",
        maxBytes=5*1024*1024,  # 5MB
        backupCount=3
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(detailed_formatter)
    logger.addHandler(error_handler)
    
    # Access log handler for API requests
    access_handler = logging.handlers.RotatingFileHandler(
        logs_dir / "renewmart_access.log",
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    access_handler.setLevel(logging.INFO)
    access_handler.setFormatter(detailed_formatter)
    
    # Create separate logger for access logs
    access_logger = logging.getLogger("renewmart.access")
    access_logger.setLevel(logging.INFO)
    access_logger.addHandler(access_handler)
    access_logger.propagate = False
    
    return logger

def get_logger(name=None):
    """
    Get a logger instance.
    
    Args:
        name: Logger name (optional)
    
    Returns:
        logger: Logger instance
    """
    if name:
        return logging.getLogger(f"renewmart.{name}")
    return logging.getLogger("renewmart")

def get_access_logger():
    """
    Get the access logger for API request logging.
    
    Returns:
        logger: Access logger instance
    """
    return logging.getLogger("renewmart.access")

def log_api_request(method, path, status_code, response_time=None, user_id=None):
    """
    Log API request details.
    
    Args:
        method: HTTP method
        path: Request path
        status_code: HTTP status code
        response_time: Response time in milliseconds (optional)
        user_id: User ID if authenticated (optional)
    """
    access_logger = get_access_logger()
    
    log_message = f"{method} {path} - {status_code}"
    
    if response_time:
        log_message += f" - {response_time:.2f}ms"
    
    if user_id:
        log_message += f" - User: {user_id}"
    
    access_logger.info(log_message)

def log_database_operation(operation, table, user_id=None, details=None):
    """
    Log database operations for audit trail.
    
    Args:
        operation: Type of operation (CREATE, READ, UPDATE, DELETE)
        table: Database table name
        user_id: User ID performing the operation (optional)
        details: Additional details (optional)
    """
    logger = get_logger("database")
    
    log_message = f"DB {operation} on {table}"
    
    if user_id:
        log_message += f" by user {user_id}"
    
    if details:
        log_message += f" - {details}"
    
    logger.info(log_message)

def log_security_event(event_type, user_id=None, ip_address=None, details=None):
    """
    Log security-related events.
    
    Args:
        event_type: Type of security event (LOGIN, LOGOUT, FAILED_LOGIN, etc.)
        user_id: User ID involved (optional)
        ip_address: IP address (optional)
        details: Additional details (optional)
    """
    logger = get_logger("security")
    
    log_message = f"SECURITY {event_type}"
    
    if user_id:
        log_message += f" - User: {user_id}"
    
    if ip_address:
        log_message += f" - IP: {ip_address}"
    
    if details:
        log_message += f" - {details}"
    
    logger.warning(log_message)

# Initialize logging when module is imported
if not logging.getLogger("renewmart").handlers:
    setup_logging()

# Integration with FastAPI logging middleware
def log_request_middleware(request, response, process_time):
    """
    Middleware function to log API requests.
    
    Args:
        request: FastAPI request object
        response: FastAPI response object
        process_time: Request processing time in seconds
    """
    # Extract user info if available
    user_id = getattr(request.state, 'user_id', None) if hasattr(request, 'state') else None
    
    # Log the API request
    log_api_request(
        method=request.method,
        path=str(request.url.path),
        status_code=response.status_code,
        response_time=process_time * 1000,  # Convert to milliseconds
        user_id=user_id
    )

def setup_request_logging():
    """
    Setup request logging for the FastAPI application.
    This should be called during application startup.
    """
    logger = get_logger('startup')
    logger.info("Request logging middleware initialized")
    logger.info(f"Log files will be stored in: {Path('logs').absolute()}")
    
    # Ensure logs directory exists
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)
    
    return True