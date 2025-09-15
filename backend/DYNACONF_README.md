# Dynaconf Configuration Guide

This application now uses [Dynaconf](https://www.dynaconf.com/) for configuration management, making it production-ready with support for multiple environments, configuration sources, and secure secret management.

## Configuration Files

### Core Configuration Files
- `settings.toml` - Main configuration file with default, development, production, and testing settings
- `.secrets.toml` - Sensitive configuration (passwords, secret keys) - **NOT committed to git**
- `.env.development` - Development environment variables
- `.env.production` - Production environment variables

### Environment Switching

Dynaconf automatically detects the environment using the `RENEWMART_ENV` environment variable:

```bash
# Development (default)
export RENEWMART_ENV=development
# or
RENEWMART_ENV=development python main.py

# Production
export RENEWMART_ENV=production
# or
RENEWMART_ENV=production python main.py

# Testing
export RENEWMART_ENV=testing
```

## Production Deployment

### 1. Environment Variables
For production, set these environment variables:

```bash
# Required
export RENEWMART_ENV=production
export SECRET_KEY="your-super-secure-secret-key-here"
export DATABASE_URL="postgresql://user:password@host:port/database"
export FRONTEND_URL="https://yourdomain.com"

# Optional (will use defaults from settings.toml)
export HOST="0.0.0.0"
export PORT="8000"
export LOG_LEVEL="WARNING"
```

### 2. Docker Deployment
```dockerfile
# In your Dockerfile
ENV RENEWMART_ENV=production
ENV SECRET_KEY=your-production-secret
ENV DATABASE_URL=postgresql://...
```

### 3. Kubernetes/Cloud Deployment
```yaml
# In your deployment.yaml
env:
  - name: RENEWMART_ENV
    value: "production"
  - name: SECRET_KEY
    valueFrom:
      secretKeyRef:
        name: renewmart-secrets
        key: secret-key
  - name: DATABASE_URL
    valueFrom:
      secretKeyRef:
        name: renewmart-secrets
        key: database-url
```

## Configuration Hierarchy

Dynaconf loads configuration in this order (later sources override earlier ones):

1. `settings.toml` [default] section
2. `settings.toml` [environment] section (e.g., [production])
3. `.secrets.toml` [default] section
4. `.secrets.toml` [environment] section
5. Environment variables with `RENEWMART_` prefix
6. `.env` files (`.env.production`, `.env.development`)

## Security Best Practices

### 1. Secrets Management
- Never commit `.secrets.toml` to version control
- Use environment variables for production secrets
- Rotate secrets regularly
- Use strong, randomly generated secret keys

### 2. Database Security
- Use connection pooling
- Enable SSL/TLS for database connections
- Use least-privilege database users
- Regular security updates

### 3. CORS Configuration
- Restrict `ALLOWED_ORIGINS` to your actual frontend domains
- Never use `["*"]` in production
- Use HTTPS in production

## Configuration Examples

### Development
```bash
# Start development server
RENEWMART_ENV=development python main.py
# or
python server.py --env development
```

### Production
```bash
# Set environment variables
export RENEWMART_ENV=production
export SECRET_KEY="$(openssl rand -hex 32)"
export DATABASE_URL="postgresql://prod_user:secure_pass@db.example.com:5432/renewmart"
export FRONTEND_URL="https://renewmart.example.com"

# Start production server
python main.py
# or
gunicorn main:app --bind 0.0.0.0:8000 --workers 4
```

## Accessing Configuration in Code

```python
from config import settings

# Access configuration values
db_url = settings.DATABASE_URL
log_level = settings.LOG_LEVEL
debug_mode = settings.DEBUG

# Check environment
if settings.get('ENVIRONMENT') == 'production':
    # Production-specific code
    pass

# Get with default value
max_workers = settings.get('MAX_WORKERS', 4)
```

## Troubleshooting

### Check Current Configuration
```python
from config import settings
print(settings.to_dict())  # Print all current settings
```

### Validate Environment
```bash
# Check which environment is active
echo $RENEWMART_ENV

# Test configuration loading
python -c "from config import settings; print(f'Environment: {settings.get(\"ENVIRONMENT\")}, Debug: {settings.DEBUG}')"
```

### Common Issues
1. **Environment not switching**: Ensure `RENEWMART_ENV` is set correctly
2. **Secrets not loading**: Check `.secrets.toml` exists and has correct format
3. **Database connection fails**: Verify `DATABASE_URL` format and credentials
4. **CORS errors**: Check `ALLOWED_ORIGINS` includes your frontend URL

## Migration from Pydantic Settings

The application has been migrated from Pydantic Settings to Dynaconf. Key changes:

- Configuration is now in TOML format instead of Python classes
- Environment variables use `RENEWMART_` prefix
- Settings are accessed directly: `settings.DATABASE_URL` instead of `settings.database.url`
- Multiple environment support is built-in
- Secrets are separated from main configuration

For more information, visit the [Dynaconf documentation](https://www.dynaconf.com/).