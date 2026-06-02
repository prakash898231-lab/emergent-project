# Cloudinary Setup Guide

This project now uses **Cloudinary** for cloud image storage. No server-side file management needed – images are hosted on Cloudinary's CDN.

## 📋 Prerequisites

You'll need a Cloudinary account. **It's free** with a generous tier (25 GB/month).

### Step 1: Create a Cloudinary Account

1. Go to https://cloudinary.com
2. Click **Sign Up** and create a free account
3. Verify your email

### Step 2: Get Your API Credentials

1. Log in to your Cloudinary dashboard
2. Look for the **API Environment variable** section (usually on the home dashboard)
3. You'll see a URL that looks like:
   ```
   cloudinary://key:secret@cloud_name
   ```
4. Extract these three values:
   - **Cloud Name**: the part after `@`
   - **API Key**: the part after `cloudinary://`
   - **API Secret**: the part after `key:`

### Step 3: Update `.env` File

In `backend/.env`, replace the placeholders:

```dotenv
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
CLOUDINARY_CLOUD_NAME="your_actual_cloud_name"
CLOUDINARY_API_KEY="your_actual_api_key"
CLOUDINARY_API_SECRET="your_actual_api_secret"
JWT_SECRET="your-secret-key"
```

**Important:** Never commit your API secret to Git! Add `.env` to `.gitignore` if you haven't already.

### Step 4: Install Dependencies

The backend now uses Cloudinary SDK:

```bash
cd backend
pip install -r requirements.txt  # includes cloudinary==1.40.0
```

### Step 5: Test It Out

1. **Start your backend:**
   ```bash
   uvicorn server:app --reload
   ```

2. **In another terminal, start the frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Log in as a seller** and try adding a product with an image.

When you select an image file, it will:
- Upload directly to Cloudinary
- Return a CDN URL (e.g., `https://res.cloudinary.com/.../image.jpg`)
- Store that URL in MongoDB with the product

### ✅ How It Works

**Flow:**
```
Seller selects image
    ↓
Frontend sends to /api/seller/products/upload
    ↓
Backend receives file, sends to Cloudinary
    ↓
Cloudinary returns secure_url
    ↓
Backend returns URL to frontend
    ↓
Seller saves product with image URL
```

### 🎯 Key Benefits

- **No local storage** – nothing clutters your server filesystem
- **CDN delivery** – images load fast worldwide
- **Auto-optimization** – Cloudinary compresses & resizes on-the-fly
- **Scalable** – handles unlimited products
- **Free tier** – 25 GB/month included

### 📖 Useful Cloudinary Features (Optional Enhancements)

Once you're comfortable, you can add:

- **Image transformations** – auto-thumbnail, cropping:
  ```python
  url = f"{upload_result['secure_url']}?w=300&h=300&c=fill"
  ```
  
- **Watermarks** – add your shop logo to images

- **Responsive images** – serve different sizes based on device

- **Analytics** – track image views and bandwidth

See [Cloudinary docs](https://cloudinary.com/documentation) for details.

### 🚨 Troubleshooting

**Upload fails with "Invalid credentials":**
- Check `.env` – ensure `CLOUDINARY_CLOUD_NAME`, `API_KEY`, and `API_SECRET` are correct
- Restart the backend after changing `.env`

**Images aren't showing:**
- Check the browser console for broken image URLs
- Verify the returned URL is a valid Cloudinary CDN link

**"CORS" errors from frontend:**
- This shouldn't happen (Cloudinary URLs are cross-origin safe)
- Check that `CORS_ORIGINS` in `.env` includes your frontend origin

---

That's it! Your e-commerce site now has professional cloud image storage. 🚀
