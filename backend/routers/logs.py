from fastapi import APIRouter, HTTPException, Query, Depends, status
from typing import Optional, List, Dict, Any
import os
import re
from datetime import datetime, timedelta
from pathlib import Path
import json
from auth import get_current_user
from models.schemas import (
    LogQueryParams, LogEntry, LogQueryResponse, ErrorResponse, 
    PaginationParams, PaginatedResponse, User
)
from pydantic import ValidationError

router = APIRouter(
    prefix="/logs", 
    tags=["logs"],
    responses={
        400: {"model": ErrorResponse, "description": "Bad Request"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        422: {"model": ErrorResponse, "description": "Validation Error"},
        500: {"model": ErrorResponse, "description": "Internal Server Error"}
    }
)

# Log file paths
LOGS_DIR = Path("logs")
LOG_FILES = {
    "general": LOGS_DIR / "renewmart.log",
    "errors": LOGS_DIR / "renewmart_errors.log",
    "access": LOGS_DIR / "renewmart_access.log"
}

def parse_log_line(line: str) -> LogEntry:
    """
    Parse a log line and extract structured information.
    
    Args:
        line: Raw log line
    
    Returns:
        LogEntry: Parsed log information as Pydantic model
    """
    # Pattern for detailed logs: timestamp - name - level - filename:line - message
    detailed_pattern = r'^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) - ([^-]+) - (\w+) - ([^:]+):(\d+) - (.+)$'
    
    # Pattern for simple logs: timestamp - level - message
    simple_pattern = r'^(\d{2}:\d{2}:\d{2}) - (\w+) - (.+)$'
    
    # Pattern for access logs: timestamp - name - level - filename:line - method path - status - details
    access_pattern = r'^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) - ([^-]+) - (\w+) - ([^:]+):(\d+) - (\w+) ([^-]+) - (\d+)(.*)$'
    
    # Try access pattern first
    match = re.match(access_pattern, line.strip())
    if match:
        timestamp, logger_name, level, filename, line_no, method, path, status, details = match.groups()
        try:
            parsed_timestamp = datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            parsed_timestamp = datetime.now()
        
        return LogEntry(
            timestamp=parsed_timestamp,
            level=level,
            source=f"{logger_name.strip()}:{filename}",
            message=f"{method} {path.strip()} - {status}{details}",
            metadata={
                "logger_name": logger_name.strip(),
                "filename": filename,
                "line_number": int(line_no),
                "method": method,
                "path": path.strip(),
                "status_code": int(status),
                "details": details.strip(),
                "type": "access"
            }
        )
    
    # Try detailed pattern
    match = re.match(detailed_pattern, line.strip())
    if match:
        timestamp, logger_name, level, filename, line_no, message = match.groups()
        try:
            parsed_timestamp = datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            parsed_timestamp = datetime.now()
        
        return LogEntry(
            timestamp=parsed_timestamp,
            level=level,
            source=f"{logger_name.strip()}:{filename}",
            message=message,
            metadata={
                "logger_name": logger_name.strip(),
                "filename": filename,
                "line_number": int(line_no),
                "type": "detailed"
            }
        )
    
    # Try simple pattern
    match = re.match(simple_pattern, line.strip())
    if match:
        timestamp, level, message = match.groups()
        try:
            # Assume today's date for simple timestamp
            today = datetime.now().date()
            parsed_timestamp = datetime.combine(today, datetime.strptime(timestamp, "%H:%M:%S").time())
        except ValueError:
            parsed_timestamp = datetime.now()
        
        return LogEntry(
            timestamp=parsed_timestamp,
            level=level,
            source="unknown",
            message=message,
            metadata={"type": "simple"}
        )
    
    # If no pattern matches, return raw line
    return LogEntry(
        timestamp=datetime.now(),
        level="UNKNOWN",
        source="unknown",
        message=line.strip(),
        metadata={"type": "raw"}
    )

def filter_logs_by_time(logs: List[LogEntry], start_time: Optional[datetime], end_time: Optional[datetime]) -> List[LogEntry]:
    """
    Filter logs by time range.
    
    Args:
        logs: List of parsed log entries
        start_time: Start time filter
        end_time: End time filter
    
    Returns:
        list: Filtered logs
    """
    if not start_time and not end_time:
        return logs
    
    filtered = []
    for log in logs:
        log_time = log.timestamp
        
        # Apply filters
        if start_time and log_time < start_time:
            continue
        if end_time and log_time > end_time:
            continue
        
        filtered.append(log)
    
    return filtered

@router.get("/", 
    response_model=LogQueryResponse,
    summary="Get filtered logs",
    description="Retrieve and filter log entries with comprehensive validation"
)
async def get_logs(
    query_params: LogQueryParams = Depends(),
    log_type: str = Query("general", description="Type of logs to retrieve (general, errors, access)"),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve and filter log entries with enhanced validation.
    
    Args:
        query_params: Validated query parameters
        log_type: Type of logs to retrieve
        current_user: Current authenticated user
    
    Returns:
        LogQueryResponse: Structured log response with metadata
    """
    try:
        # Check if user has admin privileges
        user_roles = current_user.get("roles", []) if isinstance(current_user, dict) else getattr(current_user, "roles", [])
        if "admin" not in user_roles and "administrator" not in user_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Access denied. Admin privileges required."
            )
    
        # Validate log type
        if log_type not in LOG_FILES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"Invalid log type. Available types: {list(LOG_FILES.keys())}"
            )
        
        log_file = LOG_FILES[log_type]
        
        # Check if log file exists
        if not log_file.exists():
            return LogQueryResponse(
                logs=[],
                total_count=0,
                query_params=query_params,
                execution_time_ms=0.0
            )
    
        # Start timing for performance metrics
        start_time_exec = datetime.now()
        
        # Read and parse log file
        logs = []
        with open(log_file, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    try:
                        parsed_log = parse_log_line(line)
                        logs.append(parsed_log)
                    except Exception as e:
                        # Skip malformed log lines
                        continue
        
        # Reverse to get newest first
        logs.reverse()
        
        # Apply filters
        filtered_logs = logs
        
        # Filter by time
        if query_params.start or query_params.end:
            filtered_logs = filter_logs_by_time(filtered_logs, query_params.start, query_params.end)
        
        # Filter by level
        if query_params.level:
            level_upper = query_params.level.upper()
            filtered_logs = [log for log in filtered_logs if log.level.upper() == level_upper]
        
        # Filter by source
        if query_params.source:
            filtered_logs = [log for log in filtered_logs if query_params.source.lower() in log.source.lower()]
        
        # Filter by message content
        if query_params.message:
            search_lower = query_params.message.lower()
            filtered_logs = [
                log for log in filtered_logs 
                if search_lower in log.message.lower()
            ]
        
        # Apply limit
        total = len(filtered_logs)
        limited_logs = filtered_logs[:query_params.limit]
        
        # Calculate execution time
        execution_time = (datetime.now() - start_time_exec).total_seconds() * 1000
        
        return LogQueryResponse(
            logs=limited_logs,
            total_count=total,
            query_params=query_params,
            execution_time_ms=execution_time
        )
    
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Validation error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reading log file: {str(e)}"
        )

@router.get("/stats",
    response_model=dict,
    summary="Get log statistics",
    description="Analyze log entries and provide statistical insights"
)
async def get_log_stats(
    log_type: str = Query("general", description="Type of logs to analyze"),
    hours: int = Query(24, description="Number of hours to analyze (1-168)", ge=1, le=168),
    current_user: User = Depends(get_current_user)
):
    """
    Get log statistics and summary.
    
    Args:
        log_type: Type of logs to analyze
        hours: Number of hours to look back
        current_user: Current authenticated user
    
    Returns:
        dict: Log statistics
    """
    try:
        # Check if user has admin privileges
        user_roles = current_user.get("roles", []) if isinstance(current_user, dict) else getattr(current_user, "roles", [])
        if "admin" not in user_roles and "administrator" not in user_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Admin privileges required."
            )
    
        # Validate log type
        if log_type not in LOG_FILES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid log type. Available types: {list(LOG_FILES.keys())}"
            )
        
        log_file = LOG_FILES[log_type]
        
        # Check if log file exists
        if not log_file.exists():
            return {
                "message": f"Log file {log_file.name} not found",
                "stats": {}
            }
        
        # Calculate time range
        end_time = datetime.now()
        start_time = end_time - timedelta(hours=hours)
        
        # Read and parse log file
        logs = []
        with open(log_file, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    parsed_log = parse_log_line(line)
                    logs.append(parsed_log)
        
        # Filter by time range
        filtered_logs = filter_logs_by_time(logs, start_time, end_time)
        
        # Calculate statistics
        stats = {
            "total_entries": len(filtered_logs),
            "time_range": {
                "start": start_time.strftime("%Y-%m-%d %H:%M:%S"),
                "end": end_time.strftime("%Y-%m-%d %H:%M:%S"),
                "hours": hours
            },
            "levels": {},
            "recent_errors": [],
            "top_messages": {}
        }
        
        # Count by level
        for log in filtered_logs:
            level = log.level
            stats["levels"][level] = stats["levels"].get(level, 0) + 1
        
        # Get recent errors
        error_logs = [log for log in filtered_logs if log.level in ["ERROR", "CRITICAL"]]
        stats["recent_errors"] = [log.dict() for log in error_logs[:10]]  # Last 10 errors
        
        # Count message patterns
        message_counts = {}
        for log in filtered_logs:
            message = log.message
            # Truncate long messages for grouping
            short_message = message[:100] + "..." if len(message) > 100 else message
            message_counts[short_message] = message_counts.get(short_message, 0) + 1
        
        # Get top 10 most frequent messages
        stats["top_messages"] = dict(sorted(message_counts.items(), key=lambda x: x[1], reverse=True)[:10])
        
        return {
            "log_type": log_type,
            "stats": stats
        }
    
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Validation error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing log file: {str(e)}"
        )

@router.get("/files",
    response_model=dict,
    summary="List log files",
    description="Get information about available log files"
)
async def list_log_files(
    current_user: User = Depends(get_current_user)
):
    """
    List available log files and their information.
    
    Args:
        current_user: Current authenticated user
    
    Returns:
        dict: Available log files and their metadata
    """
    try:
        # Check if user has admin privileges
        user_roles = current_user.get("roles", []) if isinstance(current_user, dict) else getattr(current_user, "roles", [])
        if "admin" not in user_roles and "administrator" not in user_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Admin privileges required."
            )
    
        files_info = {}
        
        for log_type, log_file in LOG_FILES.items():
            if log_file.exists():
                stat = log_file.stat()
                files_info[log_type] = {
                    "path": str(log_file),
                    "size_bytes": stat.st_size,
                    "size_mb": round(stat.st_size / (1024 * 1024), 2),
                    "modified": datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M:%S"),
                    "exists": True
                }
            else:
                files_info[log_type] = {
                    "path": str(log_file),
                    "exists": False
                }
        
        return {
            "log_files": files_info,
            "logs_directory": str(LOGS_DIR)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing log files: {str(e)}"
        )