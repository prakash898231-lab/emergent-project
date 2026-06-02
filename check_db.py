import asyncio
import pymongo
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from pathlib import Path

# Load .env from backend folder
load_dotenv(Path(__file__).parent / 'backend' / '.env')

async def check_database():
    print("=" * 60)
    print("🔍 MongoDB Data Verification")
    print("=" * 60)
    
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    print(f"\n📍 Connection String: {mongo_url}")
    print(f"📍 Database Name: {db_name}")
    
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        
        # Test connection
        await db.command('ping')
        print("\n✅ MongoDB Connection: SUCCESS!")
        
        # Check collections
        collections = await db.list_collection_names()
        print(f"\n📦 Collections Found: {collections}")
        
        if 'users' in collections:
            # Count users
            user_count = await db.users.count_documents({})
            print(f"\n👥 Total Users: {user_count}")
            
            if user_count > 0:
                # Show users
                users = await db.users.find().to_list(length=None)
                print(f"\n{'='*60}")
                print("📝 User Data:")
                print(f"{'='*60}")
                for i, user in enumerate(users, 1):
                    print(f"\n User #{i}:")
                    print(f"  Email: {user.get('email', 'N/A')}")
                    print(f"  Name: {user.get('name', 'N/A')}")
                    print(f"  Role: {user.get('role', 'N/A')}")
                    print(f"  Created At: {user.get('created_at', 'N/A')}")
            else:
                print("\n⚠️  No users found! Data is NOT being stored.")
        else:
            print("\n⚠️  'users' collection doesn't exist!")
        
        # Close connection
        client.close()
        
    except pymongo.errors.ServerSelectionTimeoutError:
        print("\n❌ ERROR: Cannot connect to MongoDB!")
        print("   Make sure MongoDB is running on localhost:27017")
        print("   If using Docker: docker-compose up")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")

if __name__ == "__main__":
    asyncio.run(check_database())
