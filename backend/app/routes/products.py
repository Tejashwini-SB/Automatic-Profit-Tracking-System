import csv
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from .. import database, schemas, models, auth
from ..services import audit_service

router = APIRouter(
    prefix="/api/products",
    tags=['Products']
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("", response_model=list[schemas.ProductResponse])
def get_products(
    category: str = None,
    search: str = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    query = db.query(models.Product)
    if category and category != "All":
        query = query.filter(models.Product.category == category)
    if search:
        query = query.filter(
            models.Product.product_name.ilike(f"%{search}%") |
            models.Product.category.ilike(f"%{search}%")
        )
    return query.order_by(models.Product.product_name.asc()).offset(offset).limit(limit).all()

@router.post("", response_model=schemas.ProductResponse)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.require_admin)
):
    existing = db.query(models.Product).filter(models.Product.product_name == product.product_name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Product with this name already exists")
    
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    # Audit log
    audit_service.log_action(db, current_user.id, f"Created product: {db_product.product_name} (Qty: {db_product.quantity})")
    
    return db_product

@router.put("/{id}", response_model=schemas.ProductResponse)
def update_product(
    id: int,
    product_update: schemas.ProductUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.require_admin)
):
    db_product = db.query(models.Product).filter(models.Product.id == id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    update_data = product_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
        
    db.commit()
    db.refresh(db_product)
    
    # Audit log
    audit_service.log_action(db, current_user.id, f"Updated product ID {id}: changed fields {list(update_data.keys())}")
    
    return db_product

@router.delete("/{id}")
def delete_product(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(auth.require_admin)
):
    db_product = db.query(models.Product).filter(models.Product.id == id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    product_name = db_product.product_name
    db.delete(db_product)
    db.commit()
    
    # Audit log
    audit_service.log_action(db, current_user.id, f"Deleted product: {product_name} (ID: {id})")
    
    return {"message": "Product deleted successfully"}

@router.post("/import-csv")
def import_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(auth.require_staff)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
        
    try:
        content = file.file.read().decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(content))
        
        imported_count = 0
        for row in csv_reader:
            name = row.get("product_name")
            category = row.get("category", "General")
            cost_price = float(row.get("cost_price", 0.0))
            selling_price = float(row.get("selling_price", 0.0))
            quantity = int(row.get("quantity", 0))
            
            if not name:
                continue
                
            existing = db.query(models.Product).filter(models.Product.product_name == name).first()
            if existing:
                existing.quantity += quantity
                existing.cost_price = cost_price
                existing.selling_price = selling_price
            else:
                new_p = models.Product(
                    product_name=name,
                    category=category,
                    cost_price=cost_price,
                    selling_price=selling_price,
                    quantity=quantity
                )
                db.add(new_p)
            imported_count += 1
            
        db.commit()
        
        # Audit log
        audit_service.log_action(db, current_user.id, f"Imported {imported_count} products via CSV")
        
        return {"message": f"Successfully imported {imported_count} products"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")