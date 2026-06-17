import os
from dotenv import load_dotenv
load_dotenv()  # Loads .env file in development; no-op in production

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import purchase, sales, profit, products, auth

app = FastAPI(title="Profit Tracker API", version="1.0.0")

# CORS: In production, set ALLOWED_ORIGINS env var to your frontend domain (e.g. https://your-app.vercel.app).
# During local development, the fallback allows all localhost origins.
_raw_origins = os.environ.get("ALLOWED_ORIGINS", "")
if _raw_origins:
    allow_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]
    allow_origin_regex = None
else:
    # Dev fallback: allow all localhost ports
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

app.include_router(auth.router)
app.include_router(purchase.router)
app.include_router(sales.router)
app.include_router(profit.router)
app.include_router(products.router)

@app.get("/")
def root():
    return {"message": "Profit Tracker API Running"}