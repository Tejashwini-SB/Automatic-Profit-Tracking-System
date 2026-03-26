from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import database, crud, schemas

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/products", response_model=list[schemas.ProductResponse])
def get_products(db: Session = Depends(get_db)):
    return crud.get_products(db)