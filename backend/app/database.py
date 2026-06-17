import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# In production, DATABASE_URL is set as an environment variable.
# The local fallback uses your dev Postgres instance.
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:Teju%40123@localhost/profit_db"
)

# Neon & some managed Postgres providers use 'postgres://' (deprecated in SQLAlchemy 1.4+).
# This silently upgrades it to 'postgresql://'.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()