import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import database, schemas, models, auth
from ..services import audit_service

router = APIRouter(
    prefix="/api/purchases",
    tags=['Purchases']
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("", response_model=list[schemas.PurchaseResponse])
def get_purchases(
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    purchases = db.query(models.Purchase).order_by(models.Purchase.purchased_at.desc()).offset(offset).limit(limit).all()
    res = []
    for p in purchases:
        # Pydantic v2 compatible validation
        p_res = schemas.PurchaseResponse.model_validate(p)
        p_res.product_name = p.product.product_name if p.product else "Unknown Product"
        res.append(p_res)
    return res

@router.post("", response_model=schemas.PurchaseResponse)
def create_purchase(
    purchase: schemas.PurchaseCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.require_staff)
):
    product = db.query(models.Product).filter(models.Product.id == purchase.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    total_amount = purchase.quantity * purchase.purchase_price
    
    # Update inventory
    product.quantity += purchase.quantity
    product.cost_price = purchase.purchase_price  # Auto update unit cost price
    
    db_purchase = models.Purchase(
        product_id=purchase.product_id,
        supplier=purchase.supplier,
        quantity=purchase.quantity,
        purchase_price=purchase.purchase_price,
        total_amount=total_amount,
        purchased_at=datetime.datetime.utcnow()
    )
    db.add(db_purchase)
    
    # Update/create ProfitSummary for today (expense tracking)
    today = datetime.date.today()
    summary = db.query(models.ProfitSummary).filter(models.ProfitSummary.date == today).first()
    if summary:
        summary.expense += total_amount
        summary.profit = summary.revenue - summary.expense
    else:
        summary = models.ProfitSummary(
            date=today,
            revenue=0.0,
            expense=total_amount,
            profit=-total_amount
        )
        db.add(summary)
        
    db.commit()
    db.refresh(db_purchase)
    
    # Audit log
    audit_service.log_action(db, current_user.id, f"Recorded purchase: {purchase.quantity} of {product.product_name} from {purchase.supplier} (Cost: {total_amount})")
    
    # Map to schema response
    p_res = schemas.PurchaseResponse.model_validate(db_purchase)
    p_res.product_name = product.product_name
    return p_res
