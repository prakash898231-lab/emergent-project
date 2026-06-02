import random
import string
import requests
from pymongo import MongoClient
import os

port = os.environ.get("PORT", "8001")
base = f'http://127.0.0.1:{port}/api'

print('BEGIN FLOW TEST')

cust_email = 'test_cust_' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=6)) + '@example.com'
payload = {
    'email': cust_email,
    'password': 'Test1234!',
    'name': 'Test Customer',
    'role': 'buyer',
    'phone': '9999999999',
    'address': 'Test Street'
}
res = requests.post(f'{base}/auth/register', json=payload, timeout=10)
print('REGISTER', res.status_code, res.text)
if res.status_code != 200:
    raise SystemExit('Customer register failed')

cust_token = res.json()['access_token']
print('CUSTOMER TOKEN OK')

res = requests.post(f'{base}/auth/login', json={'email': cust_email, 'password': 'Test1234!'}, timeout=10)
print('LOGIN', res.status_code, res.text)
if res.status_code != 200:
    raise SystemExit('Customer login failed')

res = requests.post(f'{base}/auth/register', json={
    'email': 'test_seller_' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=6)) + '@example.com',
    'password': 'Test1234!',
    'name': 'Test Seller',
    'role': 'seller'
}, timeout=10)
print('SELLER_REGISTER', res.status_code, res.text)
if res.status_code != 200:
    raise SystemExit('Seller register failed')

seller_token = res.json()['access_token']
print('SELLER TOKEN OK')

shop_res = requests.post(f'{base}/seller/shops', json={'name': 'Test Shop', 'image_url': 'https://example.com/shop.jpg'}, headers={'Authorization': f'Bearer {seller_token}'}, timeout=10)
print('SHOP_CREATE', shop_res.status_code, shop_res.text)
if shop_res.status_code != 200:
    raise SystemExit('Shop create failed')
shop = shop_res.json()

prod_payload = {
    'name': 'Test Product',
    'description': 'Test product description',
    'price': 15.5,
    'category': 'Electronics',
    'stock': 10,
    'image_url': 'https://example.com/product.jpg',
    'shop_id': shop['id']
}
prod_res = requests.post(f'{base}/seller/products', json=prod_payload, headers={'Authorization': f'Bearer {seller_token}'}, timeout=10)
print('PRODUCT_CREATE', prod_res.status_code, prod_res.text)
if prod_res.status_code != 200:
    raise SystemExit('Product create failed')

prod = prod_res.json()
print('PRODUCT CREATED', prod['id'])

prods = requests.get(f'{base}/products', timeout=10).json()
print('PRODUCTS COUNT', len(prods))

seller_products = requests.get(f'{base}/seller/products', headers={'Authorization': f'Bearer {seller_token}'}, timeout=10).json()
print('SELLER_PRODUCTS COUNT', len(seller_products))

client = MongoClient('mongodb://localhost:27017')
db = client['localmart']
user_doc = db.users.find_one({'email': cust_email}, {'_id': 0})
print('DB_USER', user_doc)
seller_doc = db.users.find_one({'email': res.json()['user']['email']}, {'_id': 0})
print('DB_SELLER', seller_doc)
shop_doc = db.shops.find_one({'id': shop['id']}, {'_id': 0})
print('DB_SHOP', shop_doc)
product_doc = db.products.find_one({'id': prod['id']}, {'_id': 0})
print('DB_PRODUCT', product_doc)
print('END FLOW TEST')
