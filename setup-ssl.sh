#!/bin/bash

# ===========================================
# CLURST - Free SSL Setup with Let's Encrypt
# ===========================================
# Usage: ./setup-ssl.sh your-domain.com [email]
# Example: ./setup-ssl.sh clurst.io admin@clurst.io
# ===========================================

set -e

DOMAIN=${1:-clurst.io}
EMAIL=${2:-admin@$DOMAIN}

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🔐 SSL Setup for ${DOMAIN}${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Install Certbot
echo -e "${BLUE}Step 1: Installing Certbot...${NC}"
apt-get update
apt-get install -y certbot

# Step 2: Stop frontend temporarily to free port 80
echo -e "${BLUE}Step 2: Stopping frontend container...${NC}"
docker compose stop frontend

# Step 3: Get SSL Certificate
echo -e "${BLUE}Step 3: Obtaining SSL certificate...${NC}"
certbot certonly --standalone \
    -d $DOMAIN \
    -d www.$DOMAIN \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    --no-eff-email

# Step 4: Create SSL nginx config
echo -e "${BLUE}Step 4: Creating SSL nginx config...${NC}"

mkdir -p nginx/ssl

cat > nginx/nginx-ssl.conf << 'NGINXCONF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    # Upstream servers
    upstream backend {
        server backend:8000;
    }

    upstream frontend {
        server frontend:80;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        listen [::]:80;
        server_name DOMAIN_PLACEHOLDER www.DOMAIN_PLACEHOLDER;

        # Let's Encrypt challenge
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
        server_name DOMAIN_PLACEHOLDER www.DOMAIN_PLACEHOLDER;

        # SSL Certificates
        ssl_certificate /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/privkey.pem;

        # SSL Settings
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 1d;

        # Security Headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # API Proxy
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
NGINXCONF

# Replace domain placeholder
sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" nginx/nginx-ssl.conf

# Step 5: Create docker-compose-ssl.yml
echo -e "${BLUE}Step 5: Creating SSL docker-compose...${NC}"

cat > docker-compose-ssl.yml << 'COMPOSEFILE'
services:
  # MongoDB Database
  mongodb:
    image: mongo:7.0
    container_name: clurst-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USERNAME:-admin}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD:-adminpassword}
      MONGO_INITDB_DATABASE: clurst
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - clurst-network
    healthcheck:
      test: ['CMD', 'mongosh', '--eval', "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 30s

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: clurst-backend
    restart: unless-stopped
    depends_on:
      mongodb:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 8000
      MONGODB_URI: mongodb://${MONGO_ROOT_USERNAME:-admin}:${MONGO_ROOT_PASSWORD:-adminpassword}@mongodb:27017/clurst?authSource=admin
      MONGODB_DB: clurst
      JWT_SECRET: ${JWT_SECRET}
      SALT_ROUNDS: ${SALT_ROUNDS:-10}
      FRONTEND_ORIGINS: ${FRONTEND_ORIGINS}
      FRONTEND_URL: ${FRONTEND_URL}
      APP_URL: ${APP_URL}
      APP_NAME: ${APP_NAME:-Clurst}
      FIREBASE_PROJECT_ID: ${FIREBASE_PROJECT_ID}
      FIREBASE_CLIENT_EMAIL: ${FIREBASE_CLIENT_EMAIL}
      FIREBASE_PRIVATE_KEY: ${FIREBASE_PRIVATE_KEY}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      GOOGLE_REDIRECT_URI: ${GOOGLE_REDIRECT_URI}
      EMAIL_HOST: ${EMAIL_HOST}
      EMAIL_PORT: ${EMAIL_PORT:-587}
      EMAIL_USER: ${EMAIL_USER}
      EMAIL_PASS: ${EMAIL_PASS}
      EMAIL_FROM: ${EMAIL_FROM}
      TWILIO_ACCOUNT_SID: ${TWILIO_ACCOUNT_SID}
      TWILIO_AUTH_TOKEN: ${TWILIO_AUTH_TOKEN}
      TWILIO_PHONE_NUMBER: ${TWILIO_PHONE_NUMBER}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
      GEMINI_API_KEY: ${GEMINI_API_KEY}
    networks:
      - clurst-network

  # Frontend
  frontend:
    build:
      context: ./frontent
      dockerfile: Dockerfile
      args:
        VITE_API_BASE: ${VITE_API_BASE}
        VITE_FRONTEND_URL: ${VITE_FRONTEND_URL}
        VITE_GEMINI_API_KEY: ${VITE_GEMINI_API_KEY}
        VITE_STRIPE_PUBLIC_KEY: ${VITE_STRIPE_PUBLIC_KEY}
        VITE_FIREBASE_API_KEY: ${VITE_FIREBASE_API_KEY}
        VITE_FIREBASE_AUTH_DOMAIN: ${VITE_FIREBASE_AUTH_DOMAIN}
        VITE_FIREBASE_PROJECT_ID: ${VITE_FIREBASE_PROJECT_ID}
        VITE_FIREBASE_STORAGE_BUCKET: ${VITE_FIREBASE_STORAGE_BUCKET}
        VITE_FIREBASE_MESSAGING_SENDER_ID: ${VITE_FIREBASE_MESSAGING_SENDER_ID}
        VITE_FIREBASE_APP_ID: ${VITE_FIREBASE_APP_ID}
    container_name: clurst-frontend
    restart: unless-stopped
    depends_on:
      - backend
    networks:
      - clurst-network

  # Nginx SSL Proxy
  nginx-ssl:
    image: nginx:alpine
    container_name: clurst-nginx-ssl
    restart: unless-stopped
    depends_on:
      - frontend
      - backend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx-ssl.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    networks:
      - clurst-network

networks:
  clurst-network:
    driver: bridge

volumes:
  mongodb_data:
    driver: local
COMPOSEFILE

# Step 6: Update .env for HTTPS
echo -e "${BLUE}Step 6: Updating .env for HTTPS...${NC}"
sed -i "s|http://$DOMAIN|https://$DOMAIN|g" .env
sed -i "s|FRONTEND_URL=http://|FRONTEND_URL=https://|g" .env
sed -i "s|APP_URL=http://|APP_URL=https://|g" .env
sed -i "s|VITE_FRONTEND_URL=http://|VITE_FRONTEND_URL=https://|g" .env

# Also add domain to FRONTEND_ORIGINS if not present
if ! grep -q "$DOMAIN" .env; then
    sed -i "s|FRONTEND_ORIGINS=|FRONTEND_ORIGINS=https://$DOMAIN,https://www.$DOMAIN,|g" .env
fi

# Update VITE_API_BASE to use domain
sed -i "s|VITE_API_BASE=http://[0-9.]*:8000|VITE_API_BASE=https://$DOMAIN/api|g" .env

# Step 7: Stop old containers and start with SSL
echo -e "${BLUE}Step 7: Starting with SSL...${NC}"
docker compose down
docker compose -f docker-compose-ssl.yml up --build -d

# Step 8: Setup auto-renewal cron
echo -e "${BLUE}Step 8: Setting up auto-renewal...${NC}"
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && docker compose -f $(pwd)/docker-compose-ssl.yml exec nginx-ssl nginx -s reload") | crontab -

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     🔐 SSL SETUP COMPLETE!                 ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║                                            ║${NC}"
echo -e "${GREEN}║  🌐 https://${DOMAIN}                       ${NC}"
echo -e "${GREEN}║  🔌 https://${DOMAIN}/api                   ${NC}"
echo -e "${GREEN}║                                            ║${NC}"
echo -e "${GREEN}║  ✅ Auto-renewal configured                ║${NC}"
echo -e "${GREEN}║                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
