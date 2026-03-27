from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ProductCreate(BaseModel):
    name: str
    quantity: int
    cost_price: float
    selling_price: float


class SaleCreate(BaseModel):
    product_name: str
    quantity: int
    total_sale: float

class ProductResponse(BaseModel):
    name: str
    quantity: int
    cost_price: float
    selling_price: float

    class Config:
        from_attributes = True