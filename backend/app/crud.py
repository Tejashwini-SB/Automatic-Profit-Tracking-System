from sqlalchemy.orm import Session
from . import models

def create_purchase(db: Session, purchase):
    db_purchase = models.Purchase(**purchase.dict())
    db.add(db_purchase)
    db.commit()
    db.refresh(db_purchase)
    return db_purchase


def create_sale(db: Session, sale):
    db_sale = models.Sale(**sale.dict())
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)
    return db_sale


def calculate_profit(db: Session):
    total_purchase = sum([p.total_cost for p in db.query(models.Purchase).all()])
    total_sales = sum([s.total_sale for s in db.query(models.Sale).all()])
    
    return total_sales - total_purchase

def add_purchase(db: Session, product):
    existing = db.query(models.Product).filter(models.Product.name == product.name).first()

    if existing:
        existing.quantity += product.quantity
        existing.cost_price = product.cost_price
    else:
        new_product = models.Product(**product.dict())
        db.add(new_product)

    db.commit()
    return {"message": "Purchase added"}


def add_sale(db: Session, sale):
    product = db.query(models.Product).filter(models.Product.name == sale.product_name).first()

    if not product:
        return {"error": "Product not found"}

    if product.quantity < sale.quantity:
        return {"error": "Not enough stock"}

    product.quantity -= sale.quantity

    profit = (product.selling_price - product.cost_price) * sale.quantity

    db.commit()
    return {"profit": profit}

def get_products(db: Session):
    return db.query(models.Product).all()

def get_total_profit(db: Session):
    total_profit = 0

    sales = db.query(models.Sale).all()

    for sale in sales:
        product = db.query(models.Product).filter(models.Product.name == sale.product_name).first()

        if product:
            profit = (product.selling_price - product.cost_price) * sale.quantity
            total_profit += profit

    return total_profit