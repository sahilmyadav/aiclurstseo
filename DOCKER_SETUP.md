# 🐳 Clurst Docker Deployment Guide

## Complete VPS Hosting Setup

Follow these steps to deploy your Clurst application on a VPS server.

---

## 📋 Prerequisites

### 1. Install Docker on VPS (Ubuntu 22.04/24.04)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (logout/login required after)
sudo usermod -aG docker $USER

# Install Docker Compose plugin
sudo apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### 2. Install Docker on Mac (for local testing)

1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop/
2. Install and run Docker Desktop
3. Open Terminal and verify: `docker --version`

---

## 🚀 Quick Start

### Step 1: Navigate to Project

```bash
cd /path/to/aiclurstseo
```

### Step 2: Verify Environment Files

The `.env` file in root directory should already be configured. Check it:

```bash
cat .env
```

### Step 3: Start Development Environment

```bash
./deploy.sh dev
```

Or without the script:

```bash
docker compose -f docker-compose.dev.yml up --build
```

### Step 4: Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **MongoDB**: localhost:27017

---

## 🏭 Production Deployment

### Step 1: Update Environment for Production

Edit `.env` and update these values:

```env
NODE_ENV=production
FRONTEND_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=https://yourdomain.com
APP_URL=https://yourdomain.com
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/google-callback
VITE_API_BASE=https://yourdomain.com
VITE_FRONTEND_URL=https://yourdomain.com
```

### Step 2: Update Nginx Configuration

Edit `nginx/nginx.conf` and replace `yourdomain.com` with your actual domain.

### Step 3: Start Production Containers

```bash
./deploy.sh prod
```

### Step 4: Setup SSL (HTTPS)

```bash
# Initialize SSL certificates
./deploy.sh init-ssl yourdomain.com your@email.com

# Restart with SSL
./deploy.sh prod-ssl
```

---

## 📝 Available Commands

| Command                      | Description                               |
| ---------------------------- | ----------------------------------------- |
| `./deploy.sh dev`            | Start development environment (with logs) |
| `./deploy.sh dev-d`          | Start development (detached/background)   |
| `./deploy.sh prod`           | Start production without SSL              |
| `./deploy.sh prod-ssl`       | Start production with SSL                 |
| `./deploy.sh stop`           | Stop all containers                       |
| `./deploy.sh logs`           | View logs                                 |
| `./deploy.sh logs backend`   | View backend logs only                    |
| `./deploy.sh status`         | Check container status                    |
| `./deploy.sh backup`         | Backup MongoDB                            |
| `./deploy.sh restore <file>` | Restore MongoDB from backup               |
| `./deploy.sh shell backend`  | SSH into backend container                |
| `./deploy.sh clean`          | Remove all containers + data              |

---

## 🌐 VPS Firewall Setup

```bash
# Enable UFW firewall
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                 Internet / Users                    │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼ (Port 80/443)
┌─────────────────────────────────────────────────────┐
│                Nginx Reverse Proxy                  │
│           SSL Termination + Load Balancing          │
└─────────────┬───────────────────────┬───────────────┘
              │                       │
    /api/*    │                       │ /*
    /auth/*   │                       │
              ▼                       ▼
┌─────────────────────┐   ┌─────────────────────┐
│   Backend (8000)    │   │   Frontend (80)     │
│   Node.js/Express   │   │   React + Nginx     │
│                     │   │   Static Files      │
└──────────┬──────────┘   └─────────────────────┘
           │
           ▼
┌─────────────────────┐
│  MongoDB (27017)    │
│  Persistent Volume  │
└─────────────────────┘
```

---

## 🔧 Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs backend
docker compose logs frontend

# Rebuild from scratch
docker compose down -v
docker compose up --build
```

### MongoDB connection issues

```bash
# Check if MongoDB is running
docker compose ps mongodb

# View MongoDB logs
docker compose logs mongodb
```

### Permission denied on deploy.sh

```bash
chmod +x deploy.sh
```

### Port already in use

```bash
# Find what's using the port
lsof -i :8000
lsof -i :5173

# Kill the process or stop the container
docker compose down
```

---

## 📁 File Structure

```
aiclurstseo/
├── .env                    # Main environment variables
├── .env.example            # Template for .env
├── deploy.sh               # Deployment helper script
├── docker-compose.yml      # Production compose
├── docker-compose.dev.yml  # Development compose
├── mongo-init.js           # MongoDB initialization
├── nginx/
│   └── nginx.conf          # Nginx reverse proxy config
├── backend/
│   ├── .env                # Backend-specific env
│   ├── Dockerfile          # Production Dockerfile
│   ├── Dockerfile.dev      # Development Dockerfile
│   └── ...
└── frontent/
    ├── .env                # Frontend env variables
    ├── Dockerfile          # Production multi-stage build
    ├── Dockerfile.dev      # Development with hot reload
    ├── nginx.conf          # Frontend nginx config
    └── ...
```

---

## 🔒 Security Checklist

- [ ] Change `MONGO_ROOT_PASSWORD` to a strong password
- [ ] Change `JWT_SECRET` to a long random string
- [ ] Update Firebase credentials for production
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Restrict MongoDB to localhost only
- [ ] Never commit `.env` files to git
- [ ] Setup regular database backups

---

## 📞 Support

If you encounter issues:

1. Check container logs: `./deploy.sh logs`
2. Verify environment variables: `cat .env`
3. Ensure Docker is running: `docker info`
4. Check disk space: `df -h`
