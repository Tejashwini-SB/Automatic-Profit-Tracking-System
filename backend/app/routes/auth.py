from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from .. import database, schemas, models, auth
from ..services import audit_service

router = APIRouter(
    prefix="/api/auth",
    tags=['Authentication']
)

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(auth.get_db)):
    # Check if username or email exists
    existing_email = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    existing_username = db.query(models.User).filter(models.User.username == user.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    hashed_password = auth.get_password_hash(user.password)
    
    new_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Audit log
    audit_service.log_action(db, new_user.id, f"Registered new user: {new_user.username} as {new_user.role}")
    
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(auth.get_db)):
    # Check by email or username
    user = db.query(models.User).filter(
        (models.User.email == user_credentials.username) | 
        (models.User.username == user_credentials.username)
    ).first()
    
    if not user or not auth.verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid Credentials"
        )
        
    access_token = auth.create_access_token(data={"sub": user.email})
    
    # Audit log
    audit_service.log_action(db, user.id, f"Logged in user: {user.username}")
    
    return {"access_token": access_token, "token_type": "bearer"}
