import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional, List

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    role: Optional[str] = None


# User schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Optional[str] = "Staff"  # Admin, Staff

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# Product schemas
class ProductCreate(BaseModel):
    product_name: str
    category: str
    cost_price: float
    selling_price: float
    quantity: int = 0

class ProductUpdate(BaseModel):
    product_name: Optional[str] = None
    category: Optional[str] = None
    cost_price: Optional[float] = None
    selling_price: Optional[float] = None
    quantity: Optional[int] = None

class ProductResponse(BaseModel):
    id: int
    product_name: str
    category: str
    cost_price: float
    selling_price: float
    quantity: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# Purchase schemas
class PurchaseCreate(BaseModel):
    product_id: int
    supplier: str
    quantity: int
    purchase_price: float

class PurchaseResponse(BaseModel):
    id: int
    product_id: int
    supplier: str
    quantity: int
    purchase_price: float
    total_amount: float
    purchased_at: datetime.datetime
    product_name: Optional[str] = None

    class Config:
        from_attributes = True


# Sale schemas
class SaleCreate(BaseModel):
    product_id: int
    quantity: int
    selling_price: float

class SaleResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    selling_price: float
    total_sale: float
    profit: float
    sold_at: datetime.datetime
    product_name: Optional[str] = None

    class Config:
        from_attributes = True


# Profit summary schemas
class ProfitSummaryResponse(BaseModel):
    id: int
    date: datetime.date
    revenue: float
    expense: float
    profit: float

    class Config:
        from_attributes = True


# Audit log schemas
class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    timestamp: datetime.datetime
    username: Optional[str] = None

    class Config:
        from_attributes = True


# Dashboard summary schemas
class DashboardSummary(BaseModel):
    total_products: int
    total_inventory_value: float
    total_expenses: float
    total_revenue: float
    total_profit: float

class ProfitTrendData(BaseModel):
    date: str
    revenue: float
    expense: float
    profit: float

class TopProductData(BaseModel):
    product_name: str
    quantity_sold: int
    revenue: float
    profit: float

class DashboardStatsResponse(BaseModel):
    summary: DashboardSummary
    recent_purchases: List[PurchaseResponse]
    recent_sales: List[SaleResponse]
    low_stock_products: List[ProductResponse]
    top_products: List[TopProductData]
    profit_trend: List[ProfitTrendData]