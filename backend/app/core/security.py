import os
import bcrypt
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt

# Security Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "super_secret_ksp_nexus_key_for_development")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against the hashed version using raw bcrypt."""
    password_bytes = plain_password.encode('utf-8')
    hashed_password_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_password_bytes)

def get_password_hash(password: str) -> str:
    """Generates a bcrypt hash for a plain text password."""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_bytes, salt)
    # Decode back to string so it can be stored in the PostgreSQL Text column
    return hashed_password.decode('utf-8')

def create_access_token(subject: str, role: str, expires_delta: Optional[timedelta] = None) -> str:
    """Generates a secure JWT token containing the user's ID and Role."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject), "role": role}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt