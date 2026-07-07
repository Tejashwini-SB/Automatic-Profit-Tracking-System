import datetime
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from .. import database, models, auth, schemas
from ..services import prediction_service

router = APIRouter(
    prefix="/api/dashboard",
    tags=['Dashboard']
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/summary", response_model=schemas.DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    # Total Products count
    total_products = db.query(models.Product).count()
    
    # Total Inventory Value (quantity * cost_price)
    inv_value_query = db.query(func.sum(models.Product.quantity * models.Product.cost_price)).scalar()
    total_inventory_value = float(inv_value_query) if inv_value_query else 0.0
    
    # Total Expenses (sum of purchase total_amount)
    expense_query = db.query(func.sum(models.Purchase.total_amount)).scalar()
    total_expenses = float(expense_query) if expense_query else 0.0
    
    # Total Revenue (sum of sale total_sale)
    revenue_query = db.query(func.sum(models.Sale.total_sale)).scalar()
    total_revenue = float(revenue_query) if revenue_query else 0.0
    
    # Total Profit (sum of sale profit)
    profit_query = db.query(func.sum(models.Sale.profit)).scalar()
    total_profit = float(profit_query) if profit_query else 0.0
    
    return {
        "total_products": total_products,
        "total_inventory_value": total_inventory_value,
        "total_expenses": total_expenses,
        "total_revenue": total_revenue,
        "total_profit": total_profit
    }

@router.get("/profit-trend")
def get_profit_trend(
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    # 1. Historical daily trends (last 15 days)
    history = db.query(models.ProfitSummary).order_by(models.ProfitSummary.date.desc()).limit(15).all()
    # reverse to chronological order
    history = history[::-1]
    
    chart_trends = []
    for h in history:
        chart_trends.append({
            "date": h.date.strftime("%Y-%m-%d"),
            "revenue": float(h.revenue),
            "expense": float(h.expense),
            "profit": float(h.profit)
        })
        
    # 2. Top-selling products
    top_sales = db.query(
        models.Product.product_name,
        func.sum(models.Sale.quantity).label("qty_sold"),
        func.sum(models.Sale.total_sale).label("rev_earned"),
        func.sum(models.Sale.profit).label("prof_earned")
    ).join(models.Sale, models.Sale.product_id == models.Product.id)\
     .group_by(models.Product.product_name)\
     .order_by(func.sum(models.Sale.quantity).desc())\
     .limit(5).all()
     
    top_products_list = []
    for row in top_sales:
        top_products_list.append({
            "product_name": row[0],
            "quantity_sold": int(row[1]),
            "revenue": float(row[2]),
            "profit": float(row[3])
        })
        
    # 3. Forecast calculations for the next 7 days
    forecast_data = prediction_service.forecast_profit(db, forecast_days=7)
    
    # 4. Low stock products (count + list)
    low_stock = db.query(models.Product).filter(models.Product.quantity < 10).all()
    low_stock_list = [schemas.ProductResponse.model_validate(p) for p in low_stock]
    
    # 5. Recent transactions
    recent_purchases = db.query(models.Purchase).order_by(models.Purchase.purchased_at.desc()).limit(5).all()
    recent_purchases_list = []
    for p in recent_purchases:
        p_res = schemas.PurchaseResponse.model_validate(p)
        p_res.product_name = p.product.product_name if p.product else "Unknown Product"
        recent_purchases_list.append(p_res)
        
    recent_sales = db.query(models.Sale).order_by(models.Sale.sold_at.desc()).limit(5).all()
    recent_sales_list = []
    for s in recent_sales:
        s_res = schemas.SaleResponse.model_validate(s)
        s_res.product_name = s.product.product_name if s.product else "Unknown Product"
        recent_sales_list.append(s_res)

    return {
        "profit_trend": chart_trends,
        "top_products": top_products_list,
        "forecast": forecast_data,
        "low_stock_products": low_stock_list,
        "recent_purchases": recent_purchases_list,
        "recent_sales": recent_sales_list
    }

@router.get("/audit-logs", response_model=list[schemas.AuditLogResponse])
def get_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user = Depends(auth.require_admin)
):
    logs = db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).limit(limit).all()
    res = []
    for l in logs:
        l_res = schemas.AuditLogResponse.model_validate(l)
        l_res.username = l.user.username if l.user else "System"
        res.append(l_res)
    return res
