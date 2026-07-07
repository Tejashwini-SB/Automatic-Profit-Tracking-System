import os
from dotenv import load_dotenv
load_dotenv()  # Loads .env file in development; no-op in production

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import purchases, sales, dashboard, products, auth, reports

app = FastAPI(title="Automatic Profit Tracking System API", version="1.0.0")

# CORS Configuration
_raw_origins = os.environ.get("ALLOWED_ORIGINS", "")
if _raw_origins:
    allow_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]
    allow_origin_regex = None
else:
    allow_origins = []
    allow_origin_regex = r"http://localhost(:\d+)?"

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
Base.metadata.create_all(bind=engine)

# Include Routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(purchases.router)
app.include_router(sales.router)
app.include_router(dashboard.router)
app.include_router(reports.router)

@app.get("/")
def root():
    return {"message": "Profit Tracker API Running"}