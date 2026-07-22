from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

# ==========================================
# TOKEN SCHEMAS
# ==========================================
class Token(BaseModel):
    """Schema for the JWT token response."""
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    """Schema for the decoded JWT payload."""
    sub: Optional[str] = None
    role: Optional[str] = None


# ==========================================
# ROLE SCHEMAS
# ==========================================
class RoleBase(BaseModel):
    role_name: str = Field(..., max_length=100)
    description: Optional[str] = None

class RoleResponse(RoleBase):
    id: UUID
    
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# USER SCHEMAS
# ==========================================
class UserBase(BaseModel):
    username: str = Field(..., max_length=100)
    full_name: str = Field(..., max_length=150)

class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str = Field(..., min_length=8)
    role_id: UUID

class UserLogin(BaseModel):
    """Schema for user login credentials."""
    username: str
    password: str

class UserResponse(UserBase):
    """Schema for returning user data (excludes password_hash)."""
    id: UUID
    role_id: UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)