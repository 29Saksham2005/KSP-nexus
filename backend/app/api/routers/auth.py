from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.models.all_models import AuthUser, Employee
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Explicitly define the JSON payload structure your frontend is sending
class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login_for_access_token(
    request: LoginRequest, 
    db: Session = Depends(get_db)
):
    # Query using request.username instead of form_data.username
    user = db.query(AuthUser).filter(AuthUser.username == request.username).first()
    
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(subject=user.username, role=user.role)
    
    return {
        "success": True,
        "message": "Authentication successful",
        "data": {
            "access_token": access_token,
            "token_type": "bearer"
        }
    }

@router.get("/me")
def get_user_profile(
    current_user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch the linked Employee details to get the FirstName for the UI
    employee = db.query(Employee).filter(Employee.EmployeeID == current_user.EmployeeID).first()
    
    return {
        "success": True,
        "data": {
            "id": str(current_user.id),
            "username": current_user.username,
            "full_name": employee.FirstName if employee else "Officer",
            "role_id": current_user.role
        }
    }