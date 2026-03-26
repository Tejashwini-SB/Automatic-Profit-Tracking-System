from fastapi import FastAPI
from .database import engine, Base
from .routes import purchase, sales, profit, products

app = FastAPI()

# Create tables
Base.metadata.create_all(bind=engine)

app.include_router(purchase.router)
app.include_router(sales.router)
app.include_router(profit.router)
app.include_router(products.router)

@app.get("/")
def root():
    return {"message": "Profit Tracker API Running"}