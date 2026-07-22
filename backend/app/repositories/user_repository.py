from typing import Optional
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.all_models import User
from app.schemas.user import UserCreate

# We use an empty BaseModel for the update schema here as a placeholder 
# since we are focusing on read/create for auth right now.
from pydantic import BaseModel
class UserUpdate(BaseModel):
    pass

class UserRepository(BaseRepository[User, UserCreate, UserUpdate]):
    """
    Repository for User-specific database operations.
    """
    
    def get_by_username(self, db: Session, username: str) -> Optional[User]:
        """
        Retrieve a user by their exact username. Used heavily during authentication.
        """
        return db.query(self.model).filter(self.model.username == username).first()
    
    def create_user_with_hash(self, db: Session, obj_in: UserCreate, hashed_password: str) -> User:
        """
        Create a new user, safely injecting the hashed password.
        """
        db_obj = User(
            username=obj_in.username,
            full_name=obj_in.full_name,
            role_id=obj_in.role_id,
            password_hash=hashed_password
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

# Instantiate the repository to be imported by services
user_repository = UserRepository(User)