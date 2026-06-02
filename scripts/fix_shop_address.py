from pymongo import MongoClient
from dotenv import load_dotenv
import os
from pathlib import Path

load_dotenv(Path('backend') / '.env')

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'localmart')
client = MongoClient(mongo_url)
db = client[db_name]

filter_doc = {
    'name': 'Manoj Medical',
    'seller_id': '78d2fd21-a50d-410e-954b-830c05536fd1'
}
update_doc = {
    '$set': {
        'address': 'Demo Address 123, Local Market',
        'phone': '9999999999'
    }
}
result = db.shops.update_one(filter_doc, update_doc)
print('matched:', result.matched_count, 'modified:', result.modified_count)
