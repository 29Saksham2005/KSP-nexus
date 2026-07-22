from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.user_repository import user_repository
from app.core.security import verify_password, create_access_token
from app.schemas.user import UserLogin, Token

class AuthService:
    """
    Handles all business logic related to authentication.
    """
    @staticmethod
    def authenticate_user(db: Session, credentials: UserLogin) -> Token:
        # 1. Fetch user by username via repository
        user = user_repository.get_by_username(db, username=credentials.username)
        
        # 2. Verify existence and password
        if not user or not verify_password(credentials.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # 3. Generate JWT Token
        # Note: We safely cast user.id to string and assume the role relationship is loaded
        role_name = user.role.role_name if user.role else "Read-Only User"
        access_token = create_access_token(subject=str(user.id), role=role_name)
        
        return Token(access_token=access_token, token_type="bearer")

auth_service = AuthService()