from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import purchase, sales, profit, products, auth

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(purchase.router)
app.include_router(sales.router)
app.include_router(profit.router)
app.include_router(products.router)

@app.get("/")
def root():
    return {"message": "Profit Tracker API Running"}