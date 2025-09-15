import redis
import json
import pickle
from typing import Any, Optional, Union, Dict, List
from functools import wraps
from datetime import datetime, timedelta
import logging
from config import settings
import asyncio
from contextlib import asynccontextmanager

logger = logging.getLogger(__name__)

class RedisService:
    """Redis service for caching and session management"""
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.is_connected = False
        self._initialize_connection()
    
    def _initialize_connection(self):
        """Initialize Redis connection with fallback handling"""
        try:
            self.redis_client = redis.Redis(
                host=getattr(settings, 'REDIS_HOST', 'localhost'),
                port=getattr(settings, 'REDIS_PORT', 6379),
                db=getattr(settings, 'REDIS_DB', 0),
                password=getattr(settings, 'REDIS_PASSWORD', '') or None,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True,
                health_check_interval=30
            )
            
            # Test connection
            self.redis_client.ping()
            self.is_connected = True
            logger.info(f"Redis connected successfully to {settings.REDIS_HOST}:{settings.REDIS_PORT}")
            
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}. Caching will be disabled.")
            self.redis_client = None
            self.is_connected = False
    
    def reconnect(self) -> bool:
        """Attempt to reconnect to Redis"""
        if not self.is_connected:
            self._initialize_connection()
        return self.is_connected
    
    def set(self, key: str, value: Any, expire: Optional[int] = None) -> bool:
        """Set a key-value pair in Redis with optional expiration
        
        Args:
            key: Redis key
            value: Value to store (will be JSON serialized)
            expire: Expiration time in seconds
            
        Returns:
            True if successful, False otherwise
        """
        if not self.is_connected or not self.redis_client:
            return False
            
        try:
            # Serialize complex objects to JSON
            if isinstance(value, (dict, list, tuple)):
                serialized_value = json.dumps(value, default=str)
            else:
                serialized_value = str(value)
            
            result = self.redis_client.set(key, serialized_value, ex=expire)
            return bool(result)
            
        except Exception as e:
            logger.error(f"Redis SET error for key '{key}': {e}")
            return False
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get a value from Redis
        
        Args:
            key: Redis key
            default: Default value if key doesn't exist
            
        Returns:
            Stored value or default
        """
        if not self.is_connected or not self.redis_client:
            return default
            
        try:
            value = self.redis_client.get(key)
            if value is None:
                return default
            
            # Try to deserialize JSON
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                return value
                
        except Exception as e:
            logger.error(f"Redis GET error for key '{key}': {e}")
            return default
    
    def delete(self, *keys: str) -> int:
        """Delete one or more keys from Redis
        
        Args:
            keys: Redis keys to delete
            
        Returns:
            Number of keys deleted
        """
        if not self.is_connected or not self.redis_client or not keys:
            return 0
            
        try:
            return self.redis_client.delete(*keys)
        except Exception as e:
            logger.error(f"Redis DELETE error for keys {keys}: {e}")
            return 0
    
    def exists(self, key: str) -> bool:
        """Check if a key exists in Redis
        
        Args:
            key: Redis key
            
        Returns:
            True if key exists, False otherwise
        """
        if not self.is_connected or not self.redis_client:
            return False
            
        try:
            return bool(self.redis_client.exists(key))
        except Exception as e:
            logger.error(f"Redis EXISTS error for key '{key}': {e}")
            return False
    
    def expire(self, key: str, seconds: int) -> bool:
        """Set expiration time for a key
        
        Args:
            key: Redis key
            seconds: Expiration time in seconds
            
        Returns:
            True if successful, False otherwise
        """
        if not self.is_connected or not self.redis_client:
            return False
            
        try:
            return bool(self.redis_client.expire(key, seconds))
        except Exception as e:
            logger.error(f"Redis EXPIRE error for key '{key}': {e}")
            return False
    
    def ttl(self, key: str) -> int:
        """Get time to live for a key
        
        Args:
            key: Redis key
            
        Returns:
            TTL in seconds, -1 if no expiration, -2 if key doesn't exist
        """
        if not self.is_connected or not self.redis_client:
            return -2
            
        try:
            return self.redis_client.ttl(key)
        except Exception as e:
            logger.error(f"Redis TTL error for key '{key}': {e}")
            return -2
    
    def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """Increment a numeric value in Redis
        
        Args:
            key: Redis key
            amount: Amount to increment by
            
        Returns:
            New value after increment, None if failed
        """
        if not self.is_connected or not self.redis_client:
            return None
            
        try:
            return self.redis_client.incrby(key, amount)
        except Exception as e:
            logger.error(f"Redis INCRBY error for key '{key}': {e}")
            return None
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get Redis health status
        
        Returns:
            Dictionary with health information
        """
        status = {
            "connected": self.is_connected,
            "host": getattr(settings, 'REDIS_HOST', 'localhost'),
            "port": getattr(settings, 'REDIS_PORT', 6379),
            "db": getattr(settings, 'REDIS_DB', 0)
        }
        
        if self.is_connected and self.redis_client:
            try:
                info = self.redis_client.info()
                status.update({
                    "version": info.get('redis_version', 'unknown'),
                    "uptime_seconds": info.get('uptime_in_seconds', 0),
                    "connected_clients": info.get('connected_clients', 0),
                    "used_memory_human": info.get('used_memory_human', '0B'),
                    "total_commands_processed": info.get('total_commands_processed', 0)
                })
            except Exception as e:
                status["error"] = str(e)
        
        return status

# Global Redis service instance
redis_service = RedisService()

# Caching decorators
def cache_result(expire: int = 300, key_prefix: str = ""):
    """Decorator to cache function results
    
    Args:
        expire: Cache expiration time in seconds (default: 5 minutes)
        key_prefix: Prefix for cache keys
    
    Returns:
        Decorated function
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{key_prefix}:{func.__name__}:{hash(str(args) + str(sorted(kwargs.items())))}"
            
            # Try to get from cache
            cached_result = redis_service.get(cache_key)
            if cached_result is not None:
                logger.debug(f"Cache hit for key: {cache_key}")
                return cached_result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            if result is not None:
                redis_service.set(cache_key, result, expire)
                logger.debug(f"Cached result for key: {cache_key}")
            
            return result
        return wrapper
    return decorator

def cache_async_result(expire: int = 300, key_prefix: str = ""):
    """Decorator to cache async function results
    
    Args:
        expire: Cache expiration time in seconds (default: 5 minutes)
        key_prefix: Prefix for cache keys
    
    Returns:
        Decorated async function
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{key_prefix}:{func.__name__}:{hash(str(args) + str(sorted(kwargs.items())))}"
            
            # Try to get from cache
            cached_result = redis_service.get(cache_key)
            if cached_result is not None:
                logger.debug(f"Cache hit for key: {cache_key}")
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            if result is not None:
                redis_service.set(cache_key, result, expire)
                logger.debug(f"Cached result for key: {cache_key}")
            
            return result
        return wrapper
    return decorator

# Session management
class SessionManager:
    """Redis-based session management"""
    
    def __init__(self, session_prefix: str = "session", default_expire: int = 3600):
        self.session_prefix = session_prefix
        self.default_expire = default_expire
    
    def _get_session_key(self, session_id: str) -> str:
        """Generate session key"""
        return f"{self.session_prefix}:{session_id}"
    
    def create_session(self, session_id: str, data: Dict[str, Any], expire: Optional[int] = None) -> bool:
        """Create a new session
        
        Args:
            session_id: Unique session identifier
            data: Session data
            expire: Session expiration time in seconds
            
        Returns:
            True if successful, False otherwise
        """
        key = self._get_session_key(session_id)
        expire_time = expire or self.default_expire
        
        session_data = {
            "data": data,
            "created_at": datetime.utcnow().isoformat(),
            "last_accessed": datetime.utcnow().isoformat()
        }
        
        return redis_service.set(key, session_data, expire_time)
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session data
        
        Args:
            session_id: Session identifier
            
        Returns:
            Session data or None if not found
        """
        key = self._get_session_key(session_id)
        session_data = redis_service.get(key)
        
        if session_data:
            # Update last accessed time
            session_data["last_accessed"] = datetime.utcnow().isoformat()
            redis_service.set(key, session_data, self.default_expire)
            return session_data.get("data")
        
        return None
    
    def update_session(self, session_id: str, data: Dict[str, Any]) -> bool:
        """Update session data
        
        Args:
            session_id: Session identifier
            data: New session data
            
        Returns:
            True if successful, False otherwise
        """
        key = self._get_session_key(session_id)
        existing_session = redis_service.get(key)
        
        if existing_session:
            existing_session["data"].update(data)
            existing_session["last_accessed"] = datetime.utcnow().isoformat()
            return redis_service.set(key, existing_session, self.default_expire)
        
        return False
    
    def delete_session(self, session_id: str) -> bool:
        """Delete a session
        
        Args:
            session_id: Session identifier
            
        Returns:
            True if successful, False otherwise
        """
        key = self._get_session_key(session_id)
        return redis_service.delete(key) > 0
    
    def session_exists(self, session_id: str) -> bool:
        """Check if session exists
        
        Args:
            session_id: Session identifier
            
        Returns:
            True if session exists, False otherwise
        """
        key = self._get_session_key(session_id)
        return redis_service.exists(key)

# Global session manager instance
session_manager = SessionManager()

# Cache invalidation utilities
class CacheManager:
    """Utilities for cache management and invalidation"""
    
    @staticmethod
    def invalidate_pattern(pattern: str) -> int:
        """Invalidate cache keys matching a pattern
        
        Args:
            pattern: Redis key pattern (e.g., "user:*", "cache:api:*")
            
        Returns:
            Number of keys deleted
        """
        if not redis_service.is_connected or not redis_service.redis_client:
            return 0
        
        try:
            keys = redis_service.redis_client.keys(pattern)
            if keys:
                return redis_service.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Cache invalidation error for pattern '{pattern}': {e}")
            return 0
    
    @staticmethod
    def clear_user_cache(user_id: str) -> int:
        """Clear all cache entries for a specific user
        
        Args:
            user_id: User identifier
            
        Returns:
            Number of keys deleted
        """
        patterns = [
            f"user:{user_id}:*",
            f"*:user:{user_id}:*",
            f"session:{user_id}*"
        ]
        
        total_deleted = 0
        for pattern in patterns:
            total_deleted += CacheManager.invalidate_pattern(pattern)
        
        return total_deleted
    
    @staticmethod
    def get_cache_stats() -> Dict[str, Any]:
        """Get cache statistics
        
        Returns:
            Dictionary with cache statistics
        """
        if not redis_service.is_connected or not redis_service.redis_client:
            return {"status": "disconnected"}
        
        try:
            info = redis_service.redis_client.info()
            return {
                "status": "connected",
                "total_keys": redis_service.redis_client.dbsize(),
                "memory_usage": info.get('used_memory_human', '0B'),
                "hits": info.get('keyspace_hits', 0),
                "misses": info.get('keyspace_misses', 0),
                "hit_rate": round(
                    info.get('keyspace_hits', 0) / 
                    max(info.get('keyspace_hits', 0) + info.get('keyspace_misses', 0), 1) * 100, 2
                )
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}

# Global cache manager instance
cache_manager = CacheManager()