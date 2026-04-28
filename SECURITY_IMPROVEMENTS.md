# Security Improvements & Setup Guide

## Critical Security Improvements Implemented

### 1. **Environment Variables Configuration**
- **Before**: Hardcoded database password and JWT secret in code
- **After**: All sensitive data moved to `.env` file
- **Files**: `backend/.env.example` (template), `backend/.env` (actual - not in git)

### 2. **Password Hashing with bcrypt**
- **Before**: Plain text passwords stored in database
- **After**: All passwords hashed using bcrypt (industry standard)
- **Impact**: Even if database is compromised, passwords remain secure

### 3. **Improved Error Handling**
- **Before**: Generic try-catch blocks
- **After**: Proper error handlers with logging
- **Benefits**: Better debugging, no sensitive data leakage in error messages

### 4. **Input Validation**
- **Before**: No validation on API endpoints
- **After**: Email format validation, password length checks, data type validation
- **Impact**: Prevents SQL injection and invalid data entry

### 5. **Database Connection Management**
- **Before**: New connection per request without pooling
- **After**: Connection pool with proper cleanup using context managers
- **Benefits**: Better performance, fewer connection errors

### 6. **Pagination**
- **Before**: All records fetched at once
- **After**: Pagination for products, orders, and customers
- **Benefits**: Improved performance for large datasets

### 7. **Logging System**
- **Before**: Only print statements
- **After**: Proper logging with rotating file handler
- **Benefits**: Track security events, debug issues, maintain audit trail

### 8. **Production Mode Support**
- **Before**: Debug mode always enabled
- **After**: Debug mode controlled by environment variable
- **Impact**: Safer production deployments

### 9. **File Upload Security**
- **Before**: No file size limits
- **After**: 16MB max file size limit
- **Impact**: Prevents DoS attacks through large uploads

### 10. **Token Improvements**
- **Before**: Generic token errors
- **After**: Specific error messages (expired, invalid, missing)
- **Benefits**: Better user experience and debugging

## Setup Instructions

### Prerequisites
- Python 3.8+
- MySQL/MariaDB
- Node.js 14+
- npm or yarn

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env
# On Linux/Mac:
cp .env.example .env

# Edit .env file with your credentials
# Update DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, SECRET_KEY
```

### Step 2: Database Configuration

Edit `backend/.env` with your MySQL credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_password
DB_NAME=jice

# JWT Configuration
SECRET_KEY=generate-a-random-secret-key-here

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=1
```

**Important**: 
- Generate a strong SECRET_KEY (32+ characters)
- Don't commit `.env` to version control
- Use different passwords for development and production

### Step 3: Generate Secure Secret Key

```python
# Run this Python script to generate a secure secret key
import secrets
print(secrets.token_hex(32))
```

Copy the output and paste it as SECRET_KEY in your `.env` file.

### Step 4: Run Backend Server

```bash
# From backend directory
python app.py
```

The server will:
- Create the database if it doesn't exist
- Create all necessary tables
- Create a default admin user:
  - Username: `admin`
  - Password: `admin123`
- **Important**: Change the default admin password immediately!

### Step 5: Frontend Setup

```bash
# Navigate to project root
cd ..

# Install dependencies
npm install

# Start development server
npm start
```

## Security Best Practices

### For Development
1. **Never commit `.env` file** - Add to `.gitignore`
2. **Change default admin password** on first login
3. **Use strong passwords** for database
4. **Keep dependencies updated** regularly

### For Production
1. **Set FLASK_DEBUG=0** in `.env`
2. **Use strong SECRET_KEY** (generate with secrets.token_hex(32))
3. **Enable HTTPS** for all communications
4. **Use environment-specific databases** (separate dev/prod)
5. **Regular backups** of database
6. **Monitor logs** for suspicious activity
7. **Rate limiting** on API endpoints (consider implementing)
8. **CORS restrictions** (limit to specific domains)

## Migration from Old Version

If you have existing data:

1. **Backup your database**:
   ```bash
   mysqldump -u root -p jice > backup.sql
   ```

2. **Run the password reset script** (IMPORTANT - Login won't work without this):
   ```bash
   cd backend
   python reset_admin_password.py
   ```
   
   This script will:
   - Show existing admin accounts
   - Allow you to reset passwords for existing admins OR create new ones
   - Hash passwords using bcrypt
   - Update the database immediately

3. **After password reset**:
   - Login with your new password
   - The new app will accept bcrypt-hashed passwords
   - All existing products, orders, and customers will work fine

### Quick Fix - If You Just Want to Get Started:

If you don't have any important data and want a fresh start:

1. **Drop and recreate the database**:
   ```sql
   DROP DATABASE jice;
   CREATE DATABASE jice;
   ```

2. **Run the app** - it will create:
   - Default admin: `admin` / `admin123` (password is hashed)
   - All necessary tables
   - You can login immediately

## API Changes

### New Query Parameters
All list endpoints now support pagination:

```
GET /api/products?page=1&per_page=10
GET /api/orders?page=1&per_page=10
GET /api/customers?page=1&per_page=10
```

Response format:
```json
{
  "products": [...],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 50,
    "pages": 5
  }
}
```

### Improved Error Responses
All errors now follow consistent format:
```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

## Troubleshooting

### Database Connection Error
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database exists or app has permission to create it

### Import Error: bcrypt
```bash
pip install bcrypt==4.0.1
```

### JWT Token Errors
- Check SECRET_KEY in `.env`
- Ensure it's the same for all instances
- Token expires after 24 hours

### File Upload Issues
- Check file size (max 16MB)
- Verify `backend/static/uploads` directory exists
- Check write permissions

## Additional Resources

- [Flask Security Best Practices](https://flask.palletsprojects.com/en/2.3.x/security/)
- [OWASP Python Security](https://cheatsheetseries.owasp.org/cheatsheets/Python_Security_Cheat_Sheet.html)
- [bcrypt Documentation](https://pypi.org/project/bcrypt/)

## Next Steps (Optional Improvements)

Consider implementing these additional security measures:

1. **Rate Limiting** - Use Flask-Limiter
2. **CSRF Protection** - Use Flask-WTF
3. **Email Verification** - For customer accounts
4. **Password Reset** - Via email
5. **Two-Factor Authentication** - For admin accounts
6. **API Documentation** - Use Swagger/OpenAPI
7. **Unit Tests** - Using pytest
8. **CI/CD Pipeline** - Automated testing and deployment
9. **Database Migrations** - Using Alembic
10. **Redis Caching** - For frequently accessed data

## Support

If you encounter issues:
1. Check `backend/app.log` for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check database connection and permissions
5. Review this guide for common solutions

---

**Last Updated**: April 2026
**Version**: 2.0.0 (Security Enhanced)