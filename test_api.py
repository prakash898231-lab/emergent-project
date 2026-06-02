import requests, time, os

port = os.environ.get("PORT", "8001")
BASE = f'http://127.0.0.1:{port}/api'
email = f'seller_{int(time.time())}@example.com'
password = 'Password123!'

print('Registering seller:', email)
res = requests.post(f'{BASE}/auth/register', json={'email': email, 'password': password, 'name': 'Auto Seller', 'role': 'seller'})
print('Status:', res.status_code)
print(res.text)
if res.status_code != 200:
    raise SystemExit('Register failed')

token = res.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# Create shop
print('\nCreating shop...')
res = requests.post(f'{BASE}/seller/shops', json={'name': 'Auto Shop', 'image_url': ''}, headers=headers)
print('Status:', res.status_code)
print(res.text)
if res.status_code != 200:
    raise SystemExit('Create shop failed')
shop = res.json()

# Create product
print('\nCreating product...')
product = {
    'name': 'Auto Product',
    'description': 'Test product',
    'price': 9.99,
    'category': 'Test',
    'stock': 10,
    'image_url': '',
    'shop_id': shop['id']
}
res = requests.post(f'{BASE}/seller/products', json=product, headers=headers)
print('Status:', res.status_code)
print(res.text)
if res.status_code != 200:
    raise SystemExit('Create product failed')

print('\nTest completed. Created product id:', res.json().get('id'))
