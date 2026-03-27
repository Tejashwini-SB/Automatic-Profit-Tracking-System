from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import schemas, crud, database, auth

router = APIRouter(tags=['Sales'])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/sale")
def add_sale(sale: schemas.SaleCreate, db: Session = Depends(get_db), current_user = Depends(auth.get_current_user)):
    return crud.add_sale(db, sale)