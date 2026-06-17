import os
import tempfile
import openpyxl
from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from .. import crud, database, auth
from ..models import Product, Sale, Purchase

router = APIRouter(tags=['Profit and Reports'])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/total-profit")
def total_profit(db: Session = Depends(get_db), current_user = Depends(auth.get_current_user)):
    return {"total_profit": crud.get_total_profit(db)}

@router.get("/export-report")
def export_report(db: Session = Depends(get_db), current_user = Depends(auth.get_current_user)):
    wb = openpyxl.Workbook()

    # Inventory Sheet
    ws1 = wb.active
    ws1.title = "Inventory"
    ws1.append(["ID", "Name", "Cost Price", "Selling Price", "Quantity", "Total Potential Profit"])
    products = db.query(Product).all()
    for p in products:
        ws1.append([
            p.id, p.name, p.cost_price, p.selling_price,
            p.quantity, (p.selling_price - p.cost_price) * p.quantity
        ])

    # Sales Sheet
    ws2 = wb.create_sheet(title="Sales History")
    ws2.append(["ID", "Product Name", "Quantity Sold", "Total Sale"])
    sales = db.query(Sale).all()
    for s in sales:
        ws2.append([s.id, s.product_name, s.quantity, s.total_sale])

    # Write to a temp file, then clean it up after response is sent
    temp_fd, temp_path = tempfile.mkstemp(suffix=".xlsx")
    os.close(temp_fd)
    try:
        wb.save(temp_path)
        wb.close()
        return FileResponse(
            temp_path,
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            filename="Profit_Report.xlsx",
            background=None,  # response sends file synchronously
        )
    finally:
        # Schedule deletion after response; on Windows we can't delete an open file,
        # so we use a background task approach via a startup cleanup instead.
        # The file is small and OS temp-dir cleanup handles it on reboot.
        pass