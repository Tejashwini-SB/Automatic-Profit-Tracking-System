import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import database, schemas, models, auth
from ..services import audit_service

router = APIRouter(
    prefix="/api/sales",
    tags=['Sales']
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("", response_model=list[schemas.SaleResponse])
def get_sales(
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    sales = db.query(models.Sale).order_by(models.Sale.sold_at.desc()).offset(offset).limit(limit).all()
    res = []
    for s in sales:
        s_res = schemas.SaleResponse.model_validate(s)
        s_res.product_name = s.product.product_name if s.product else "Unknown Product"
        res.append(s_res)
    return res

@router.post("", response_model=schemas.SaleResponse)
def create_sale(
    sale: schemas.SaleCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.require_staff)
):
    product = db.query(models.Product).filter(models.Product.id == sale.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    if product.quantity < sale.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough stock. Only {product.quantity} units available."
        )
        
    total_sale = sale.quantity * sale.selling_price
    # Profit calculation: (selling price - cost price) * quantity
    sale_profit = (sale.selling_price - product.cost_price) * sale.quantity
    
    # Deduct stock
    product.quantity -= sale.quantity
    
    db_sale = models.Sale(
        product_id=sale.product_id,
        quantity=sale.quantity,
        selling_price=sale.selling_price,
        total_sale=total_sale,
        profit=sale_profit,
        sold_at=datetime.datetime.utcnow()
    )
    db.add(db_sale)
    
    # Update/create ProfitSummary for today (revenue and profit tracking)
    today = datetime.date.today()
    summary = db.query(models.ProfitSummary).filter(models.ProfitSummary.date == today).first()
    if summary:
        summary.revenue += total_sale
        summary.profit += sale_profit
    else:
        summary = models.ProfitSummary(
            date=today,
            revenue=total_sale,
            expense=0.0,
            profit=sale_profit
        )
        db.add(summary)
        
    db.commit()
    db.refresh(db_sale)
    
    # Audit log
    audit_service.log_action(db, current_user.id, f"Recorded sale: {sale.quantity} of {product.product_name} (Total: {total_sale}, Profit: {sale_profit})")
    
    # Map to schema response
    s_res = schemas.SaleResponse.model_validate(db_sale)
    s_res.product_name = product.product_name
    return s_res