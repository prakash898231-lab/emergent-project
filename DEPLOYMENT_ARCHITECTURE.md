# Deployment Architecture

## 📦 What's Been Added

### Docker Files
- **Dockerfile.backend** – Python/FastAPI container
- **Dockerfile.frontend** – Node.js React container (multi-stage build)
- **docker-compose.yml** – Orchestrates backend, frontend, and MongoDB locally

### Scripts
- **docker-up.sh** – Bash script to start containers (macOS/Linux)
- **docker-up.bat** – Batch script to start containers (Windows)
- **Procfile** – For Heroku deployments

### CI/CD
- **.github/workflows/ci-cd.yml** – GitHub Actions pipeline:
  - Runs backend tests on pull requests
  - Builds Docker images
  - Pushes to GitHub Container Registry (ghcr.io)

### Documentation
- **DEPLOYMENT.md** – Step-by-step guides for 4 hosting platforms
- **CLOUDINARY_SETUP.md** – Image storage setup (already created)

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  CI/CD Pipeline (GitHub Actions)        │
│  On push → Test → Build Docker images → Push to Registry│
└─────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────────┐
│                     Hosting Platform                           │
│  (Heroku / Railway / DigitalOcean / Render)                   │
│                                                                │
│  ┌──────────────────┐      ┌──────────────────┐              │
│  │    Frontend      │      │    Backend       │              │
│  │  (React)         │      │  (FastAPI)       │              │
│  │  Port 3000       │      │  Port 8000       │              │
│  └──────────────────┘      └────────┬─────────┘              │
│                                    │                          │
│                            ┌───────▼────────┐               │
│                            │   MongoDB      │               │
│                            │   (Atlas/Managed)              │
│                            └────────────────┘               │
│                                                              │
│  External:                                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Cloudinary (Image CDN)                       │  │
│  │         Handles product image uploads & delivery     │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Options

### Local Testing (Your Machine)
```bash
docker-compose up -d
# Opens: http://localhost:3000
```

### Deploy to Heroku (Easiest)
```bash
brew install heroku
heroku login
heroku create your-app-name
git push heroku main
```

### Deploy to Railway (Modern)
- Sign in at railway.app
- Select "Deploy from GitHub"
- Connect your repo
- Auto-deploys on git push

### Deploy to DigitalOcean (Most Control)
1. Create account
2. Create MongoDB database
3. Create App Platform project
4. Connect GitHub repo

---

## 🔄 Deployment Workflow

1. **Make code changes** locally
2. **Commit & push** to GitHub
3. **GitHub Actions runs**:
   - Backend tests
   - Builds Docker images
   - Pushes to container registry
4. **Hosting platform auto-deploys**:
   - Pulls latest image
   - Restarts services
   - Update is live

---

## 📋 Files & Their Purpose

| File | Purpose |
|------|---------|
| `Dockerfile.backend` | Python/FastAPI container definition |
| `Dockerfile.frontend` | React app multi-stage build |
| `docker-compose.yml` | Local orchestration (backend + frontend + MongoDB) |
| `docker-up.sh` | Convenience script for macOS/Linux users |
| `docker-up.bat` | Convenience script for Windows users |
| `Procfile` | Heroku deployment configuration |
| `.github/workflows/ci-cd.yml` | Automated testing & building on GitHub |
| `.dockerignore` | Files to exclude from Docker builds |
| `DEPLOYMENT.md` | Complete deployment guide with platform instructions |

---

## ✅ Next Steps

1. **Test locally**:
   ```bash
   # Mac/Linux:
   bash docker-up.sh
   
   # Windows:
   docker-up.bat
   ```

2. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add Docker and deployment configs"
   git push origin main
   ```

3. **Choose a hosting platform** and follow [DEPLOYMENT.md](DEPLOYMENT.md) for your platform

4. **Monitor & scale** as your user base grows

---

## 💰 Cost Estimate (Production Setup)

| Component | Free | Cost/month |
|-----------|------|-----------|
| Frontend hosting (Vercel) | ✓ | $0 |
| Backend hosting (Railway) | ✓ | ~$5-10 |
| MongoDB Atlas (free tier) | ✓ | $0 |
| Domain (Namecheap) | ✗ | ~$1/yr |
| Cloudinary (25GB/mo) | ✓ | $0 |
| **Total** | | **~$5-10/mo** |

Or go 100% free on Heroku's free tier (slower, 30-minute idle sleep).

---

Ready to deploy? Start with [DEPLOYMENT.md](DEPLOYMENT.md)! 🚀
