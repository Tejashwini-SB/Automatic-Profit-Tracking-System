from pydantic import BaseModel

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