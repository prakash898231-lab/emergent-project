from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path
import os

load_dotenv(Path('backend') / '.env')
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'localmart')

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

shops = list(db.shops.find({'$or': [{'address': None}, {'address': ''}, {'address': 'MP'}, {'phone': None}, {'phone': ''}]}, {'_id': 0, 'name': 1, 'address': 1, 'phone': 1}))
print(f'Found {len(shops)} shops needing address/phone updates.')

address_map = {
    'Siya Sringar': 'Gali No. 7, Main Market, Sidhi (MP)',
    'Santosh Kirana Store': 'Gali No. 5, Bazaar Road, Sidhi (MP)',
    'Rajasthan Misthan': 'Gali No. 2, Food Street, Sidhi (MP)',
    'Raj Collection': 'Gali No. 3, Cloth Market, Sidhi (MP)',
}
phone_map = {
    'Siya Sringar': '9000000001',
    'Santosh Kirana Store': '9000000002',
    'Rajasthan Misthan': '9000000003',
    'Raj Collection': '9000000004',
}

base_phone = 9000000000
for idx, shop in enumerate(shops, start=1):
    name = shop['name'].strip()
    address = shop.get('address')
    phone = shop.get('phone')
    if not address or str(address).strip().upper() == 'MP':
        address = address_map.get(name, f'Gali No. {idx + 1}, Local Market, Sidhi (MP)')
    if not phone:
        phone = phone_map.get(name, str(base_phone + idx))
    result = db.shops.update_one({'name': shop['name']}, {'$set': {'address': address, 'phone': phone}})
    print(f"Updated {shop['name']}: address={address}, phone={phone}, matched={result.matched_count}, modified={result.modified_count}")
print('Done updating shop addresses and phones.')
