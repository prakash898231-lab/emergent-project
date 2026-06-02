# Deployment Guide

Your **LocalMart** e-commerce app is ready to deploy! This guide covers Docker setup and multiple hosting options.

## 📦 Prerequisites

- **Docker** (free, cross-platform): https://www.docker.com/products/docker-desktop
- **Git** (for GitHub-based deployments)
- **Cloudinary credentials** (already configured in `.env`)

---

## 🐳 Docker Setup (Local Testing)

### 1. Build with Docker Compose

```bash
docker-compose up -d
```

This starts:
- **MongoDB** on `localhost:27017`
- **Backend** on `localhost:8000`
- **Frontend** on `localhost:3000`

Visit http://localhost:3000 in your browser.

### 2. Check Logs

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 3. Stop Everything

```bash
docker-compose down
```

---

## 🚀 Deployment Options

### Option A: Heroku (Free Tier Available, Easy Setup)

**Pros:** Free tier, one-click deploys, automatic SSL, built-in MongoDB add-on  
**Cons:** Sleeping dynos on free tier, limited performance

#### Steps:

1. **Install Heroku CLI**: https://devcenter.heroku.com/articles/heroku-cli

2. **Create app**:
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Add MongoDB**:
   ```bash
   heroku addons:create mongolab:sandbox
   ```
   Heroku will set `MONGODB_URI` automatically.

4. **Set Cloudinary secrets**:
   ```bash
   heroku config:set CLOUDINARY_CLOUD_NAME=xxx
   heroku config:set CLOUDINARY_API_KEY=xxx
   heroku config:set CLOUDINARY_API_SECRET=xxx
   heroku config:set JWT_SECRET=your-very-long-random-secret
   heroku config:set CORS_ORIGINS=https://your-app-name.herokuapp.com
   ```

5. **Create `Procfile`** in root:
   ```
   web: uvicorn backend.server:app --port $PORT --host 0.0.0.0
   release: python backend_test.py
   ```

6. **Deploy**:
   ```bash
   git push heroku main
   ```

---

### Option B: Railway (Modern, Pay-as-You-Go)

**Pros:** Modern UI, generous free tier, easy scaling  
**Cons:** Pay-per-use after free quota

#### Steps:

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub"
4. Select your repository
5. Add services:
   - **Backend**: Dockerfile.backend
   - **Frontend**: Dockerfile.frontend
   - **MongoDB**: Built-in template
6. Set environment variables in Railway dashboard
7. Deploy with a git push

---

### Option C: DigitalOcean App Platform (Affordable, Full Control)

**Pros:** $5-12/month, full control, good documentation  
**Cons:** Manual config more involved

#### Steps:

1. Create DigitalOcean account: https://www.digitalocean.com
2. Create a database: Databases → MongoDB
3. Create App Platform project:
   - Connect GitHub repo
   - Configure services (backend, frontend)
   - Set environment variables
4. Deploy

---

### Option D: Docker Hub + Render (Docker-Native)

**Pros:** Uses your Docker images directly, fast cold starts  
**Cons:** Requires Docker Hub account

#### Steps:

1. **Push to Docker Hub**:
   ```bash
   docker login
   docker tag emergent-backend:latest your-hub-username/emergent-backend:latest
   docker push your-hub-username/emergent-backend:latest
   
   docker tag emergent-frontend:latest your-hub-username/emergent-frontend:latest
   docker push your-hub-username/emergent-frontend:latest
   ```

2. Go to https://render.com
3. Create new Web Service
4. Use `your-hub-username/emergent-backend:latest` as image
5. Set environment variables
6. Deploy

---

## 📋 Environment Variables Checklist

Before deploying anywhere, ensure you have:

```bash
MONGO_URL=mongodb://...           # or MONGODB_URI
DB_NAME=localmart
JWT_SECRET=your-long-random-secret
CORS_ORIGINS=https://your-domain.com

CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

**Never commit secrets to Git!** Use platform-specific secret managers:
- Heroku: `heroku config:set KEY=value`
- Railway: Dashboard → Variables
- DigitalOcean: App Platform → Settings
- Render: Environment tab

---

## 🔍 Testing After Deployment

1. **Test backend API**:
   ```bash
   curl https://your-backend-url.com/api/products
   ```

2. **Test image upload**:
   - Log in as seller
   - Add product with image
   - Verify it uploads to Cloudinary

3. **Check logs**:
   - Heroku: `heroku logs --tail`
   - Railway/DO: Dashboard → Logs

---

## 🎯 CI/CD with GitHub Actions

Your repo includes `.github/workflows/ci-cd.yml` which:

1. **On every push to `main`/`develop`**:
   - Runs backend tests
   - Builds Docker images
   - Pushes to GitHub Container Registry

2. **Connect to Heroku/Railway**:
   - Most platforms watch for new images automatically
   - Or configure webhooks in the CI pipeline

---

## 💡 Production Tips

1. **Use MongoDB Atlas** (free tier, managed):
   - Automatic backups, security patching

2. **Enable HTTPS**:
   - All platforms provide free SSL certificates

3. **Set up monitoring**:
   - Use Sentry for error tracking
   - Use LogRocket for frontend debugging

4. **Scale the database**:
   - Start with 1 shared instance
   - Upgrade to dedicated as traffic grows

5. **CDN for static assets**:
   - Cloudinary already handles product images
   - Use CloudFlare for frontend static files

---

## 📞 Recommended Setup for Production

```
┌─────────────────┐
│  Your Domain    │
│  (Namecheap)    │
└────────┬────────┘
         │
    ┌────▼──────┐
    │ Cloudflare│  (free CDN + security)
    └────┬──────┘
         │
    ┌────┴──────────────────┐
    │                       │
 ┌──▼──────────┐      ┌────▼───────────┐
 │  Frontend   │      │   Backend      │
 │  (Vercel)  │      │   (Railway)    │
 └────────────┘      └────┬───────────┘
                           │
                      ┌────▼──────────┐
                      │ MongoDB Atlas │
                      │  (free tier)  │
                      └───────────────┘
```

This setup is free or very cheap and scales smoothly.

---

## 🆘 Troubleshooting

**"Connection refused" error**:
- Check `MONGO_URL` format
- Verify MongoDB is running
- Check firewall/VPN settings

**"CORS error" on frontend**:
- Ensure `CORS_ORIGINS` includes your frontend domain
- Restart backend after changing env vars

**"Image upload fails"**:
- Verify Cloudinary credentials in `.env`
- Check file size (Cloudinary free tier has limits)

**"Database not persisting"**:
- Use managed service (MongoDB Atlas) instead of Docker container
- Docker containers lose data on restart

---

Ready to go live? Pick an option above and deploy! 🚀
