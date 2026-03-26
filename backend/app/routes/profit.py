from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud, database

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()



@router.get("/total-profit")
def total_profit(db: Session = Depends(get_db)):
    return {"total_profit": crud.get_total_profit(db)}