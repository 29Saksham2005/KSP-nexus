from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserLogin, UserResponse
from app.services.auth_service import auth_service
from app.api.dependencies import get_current_user
from app.models.all_models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate a user and return a JWT token.
    Follows API Spec: POST /auth/login
    """
    token = auth_service.authenticate_user(db, credentials)
    return {
        "success": True,
        "message": "Authentication successful",
        "data": token.model_dump()
    }

@router.get("/me", response_model=dict)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the currently authenticated user's profile.
    Follows API Spec: GET /auth/me
    """
    # Convert SQLAlchemy model to Pydantic schema for safe serialization
    user_data = UserResponse.model_validate(current_user)
    return {
        "success": True,
        "message": "User profile retrieved",
        "data": user_data.model_dump(mode='json')
    }

@router.post("/logout")
def logout():
    """
    Invalidate the current session. 
    (In stateless JWT, this typically tells the frontend to discard the token).
    Follows API Spec: POST /auth/logout
    """
    return {
        "success": True,
        "message": "Logged out successfully",
        "data": {}
    }