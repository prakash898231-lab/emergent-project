import requests
import time
import os

port = os.environ.get("PORT", "8001")
API = f"http://127.0.0.1:{port}/api"

headers = {'Content-Type': 'application/json'}

def register(email, password, name, role):
    body = {
        "email": email,
        "password": password,
        "name": name,
        "role": role
    }
    r = requests.post(f"{API}/auth/register", json=body, headers=headers, timeout=10)
    print(f"REGISTER {email} -> {r.status_code}")
    try:
        print(r.json())
    except Exception:
        print(r.text)
    r.raise_for_status()
    return r.json()

def login(email, password):
    body = {"email": email, "password": password}
    r = requests.post(f"{API}/auth/login", json=body, headers=headers, timeout=10)
    print(f"LOGIN {email} -> {r.status_code}")
    print(r.json())
    r.raise_for_status()
    return r.json()

def create_shop(token, name):
    h = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    body = {"name": name}
    r = requests.post(f"{API}/seller/shops", json=body, headers=h, timeout=10)
    print(f"CREATE SHOP -> {r.status_code}")
    print(r.json())
    r.raise_for_status()
    return r.json()

def create_product(token, product):
    h = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    r = requests.post(f"{API}/seller/products", json=product, headers=h, timeout=10)
    print(f"CREATE PRODUCT -> {r.status_code}")
    try:
        print(r.json())
    except Exception:
        print(r.text)
    r.raise_for_status()
    return r.json()


def get_products():
    r = requests.get(f"{API}/products", timeout=10)
    print(f"GET PRODUCTS -> {r.status_code}")
    print(r.json())
    r.raise_for_status()
    return r.json()

if __name__ == '__main__':
    buyer_email = f"buyer_{int(time.time())}@example.com"
    seller_email = f"seller_{int(time.time())}@example.com"
    password = "Test1234"

    # Register buyer and seller
    reg_buyer = register(buyer_email, password, "Buyer Test", "buyer")
    reg_seller = register(seller_email, password, "Seller Test", "seller")

    # Login seller
    login_s = login(seller_email, password)
    token_s = login_s["access_token"]

    # Create shop
    shop = create_shop(token_s, "Test Shop")
    shop_id = shop["id"]

    # Create product
    product_payload = {
        "name": "Test Product",
        "description": "Integration test product",
        "price": 9.99,
        "category": "Electronics",
        "stock": 10,
        "image_url": "",
        "shop_id": shop_id
    }

    prod = create_product(token_s, product_payload)

    # Fetch products
    prods = get_products()

    # Summary
    print('\n=== SUMMARY ===')
    print('Buyer registered:', reg_buyer['user']['email'])
    print('Seller registered:', reg_seller['user']['email'])
    print('Shop created id:', shop_id)
    print('Product created id:', prod['id'])
    print('Total products now:', len(prods))
