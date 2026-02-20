from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 72

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    role: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    user: UserResponse

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    stock: int
    image_url: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    description: str
    price: float
    category: str
    stock: int
    image_url: Optional[str] = None
    seller_id: str
    created_at: str

class CartItemCreate(BaseModel):
    product_id: str
    quantity: int

class CartItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    product_id: str
    quantity: int
    product: Optional[Product] = None

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    items: List[CartItem]

class OrderCreate(BaseModel):
    delivery_address: str
    phone: str

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    items: List[OrderItem]
    total_amount: float
    delivery_address: str
    phone: str
    payment_method: str
    status: str
    created_at: str

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    hashed_pwd = hash_password(user_data.password)
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password": hashed_pwd,
        "name": user_data.name,
        "role": user_data.role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_access_token({"sub": user_id})
    user_response = UserResponse(
        id=user_id,
        email=user_data.email,
        name=user_data.name,
        role=user_data.role,
        created_at=user_doc["created_at"]
    )
    return TokenResponse(access_token=token, user=user_response)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user["id"]})
    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user["role"],
        created_at=user["created_at"]
    )
    return TokenResponse(access_token=token, user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.get("/cart", response_model=Cart)
async def get_cart(current_user: dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not cart:
        return Cart(user_id=current_user["id"], items=[])
    
    for item in cart["items"]:
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            item["product"] = product
    
    return cart

@api_router.post("/cart")
async def add_to_cart(item: CartItemCreate, current_user: dict = Depends(get_current_user)):
    product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    cart = await db.carts.find_one({"user_id": current_user["id"]}, {"_id": 0})
    
    if not cart:
        cart = {"user_id": current_user["id"], "items": []}
    
    existing_item = next((i for i in cart["items"] if i["product_id"] == item.product_id), None)
    if existing_item:
        existing_item["quantity"] += item.quantity
    else:
        cart["items"].append({"product_id": item.product_id, "quantity": item.quantity})
    
    await db.carts.update_one(
        {"user_id": current_user["id"]},
        {"$set": cart},
        upsert=True
    )
    
    return {"message": "Item added to cart"}

@api_router.put("/cart/{product_id}")
async def update_cart_item(product_id: str, quantity: int, current_user: dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    item = next((i for i in cart["items"] if i["product_id"] == product_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not in cart")
    
    if quantity <= 0:
        cart["items"] = [i for i in cart["items"] if i["product_id"] != product_id]
    else:
        item["quantity"] = quantity
    
    await db.carts.update_one(
        {"user_id": current_user["id"]},
        {"$set": cart}
    )
    
    return {"message": "Cart updated"}

@api_router.delete("/cart/{product_id}")
async def remove_from_cart(product_id: str, current_user: dict = Depends(get_current_user)):
    await db.carts.update_one(
        {"user_id": current_user["id"]},
        {"$pull": {"items": {"product_id": product_id}}}
    )
    return {"message": "Item removed"}

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate, current_user: dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not cart or not cart["items"]:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    order_items = []
    total = 0
    
    for item in cart["items"]:
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if not product:
            continue
        if product["stock"] < item["quantity"]:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product['name']}")
        
        order_items.append({
            "product_id": product["id"],
            "product_name": product["name"],
            "quantity": item["quantity"],
            "price": product["price"]
        })
        total += product["price"] * item["quantity"]
        
        await db.products.update_one(
            {"id": product["id"]},
            {"$inc": {"stock": -item["quantity"]}}
        )
    
    order_id = str(uuid.uuid4())
    order_doc = {
        "id": order_id,
        "user_id": current_user["id"],
        "items": order_items,
        "total_amount": total,
        "delivery_address": order_data.delivery_address,
        "phone": order_data.phone,
        "payment_method": "Cash on Delivery",
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order_doc)
    await db.carts.delete_one({"user_id": current_user["id"]})
    
    return Order(**order_doc)

@api_router.get("/orders", response_model=List[Order])
async def get_orders(current_user: dict = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": current_user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return orders

@api_router.post("/seller/products", response_model=Product)
async def create_product(product_data: ProductCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "seller":
        raise HTTPException(status_code=403, detail="Only sellers can create products")
    
    product_id = str(uuid.uuid4())
    product_doc = {
        "id": product_id,
        "seller_id": current_user["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        **product_data.model_dump()
    }
    
    await db.products.insert_one(product_doc)
    return Product(**product_doc)

@api_router.get("/seller/products", response_model=List[Product])
async def get_seller_products(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "seller":
        raise HTTPException(status_code=403, detail="Only sellers can access this")
    
    products = await db.products.find({"seller_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    return products

@api_router.put("/seller/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "seller":
        raise HTTPException(status_code=403, detail="Only sellers can update products")
    
    product = await db.products.find_one({"id": product_id, "seller_id": current_user["id"]}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = {k: v for k, v in product_data.model_dump().items() if v is not None}
    if update_data:
        await db.products.update_one({"id": product_id}, {"$set": update_data})
        product.update(update_data)
    
    return Product(**product)

@api_router.delete("/seller/products/{product_id}")
async def delete_product(product_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "seller":
        raise HTTPException(status_code=403, detail="Only sellers can delete products")
    
    result = await db.products.delete_one({"id": product_id, "seller_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted"}

@api_router.get("/seller/orders", response_model=List[Order])
async def get_seller_orders(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "seller":
        raise HTTPException(status_code=403, detail="Only sellers can access this")
    
    products = await db.products.find({"seller_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    product_ids = [p["id"] for p in products]
    
    orders = await db.orders.find(
        {"items.product_id": {"$in": product_ids}},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    
    return orders

@api_router.put("/seller/orders/{order_id}")
async def update_order_status(order_id: str, status: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "seller":
        raise HTTPException(status_code=403, detail="Only sellers can update orders")
    
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order status updated"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()