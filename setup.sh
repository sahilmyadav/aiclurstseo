#!/bin/bash

# ===========================================
# CLURST - Automatic Setup Script
# ===========================================
# This script automatically sets up the entire project
# Usage: ./setup.sh [dev|prod] [YOUR_VPS_IP]
# ===========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_header() {
    echo -e "\n${BLUE}=============================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}=============================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Detect mode and IP
MODE=${1:-prod}
VPS_IP=${2:-$(hostname -I 2>/dev/null | awk '{print $1}' || curl -s ifconfig.me 2>/dev/null || echo "localhost")}

# Remove whitespace
VPS_IP=$(echo "$VPS_IP" | xargs)

print_header "🚀 CLURST Auto Setup Script"
echo "Mode: $MODE"
echo "Detected IP: $VPS_IP"
echo ""

# ==========================================
# Step 1: Check Docker
# ==========================================
print_header "Step 1: Checking Docker Installation"

if ! command -v docker &> /dev/null; then
    print_warning "Docker not found. Installing Docker..."

    # Install Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh

    # Add current user to docker group
    sudo usermod -aG docker $USER

    # Start Docker
    sudo systemctl start docker
    sudo systemctl enable docker

    print_success "Docker installed successfully!"
else
    print_success "Docker is already installed: $(docker --version)"
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_warning "Docker Compose not found. Installing..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed!"
else
    print_success "Docker Compose is available"
fi

# ==========================================
# Step 2: Generate .env file
# ==========================================
print_header "Step 2: Generating Environment File"

# Generate random secrets
generate_secret() {
    openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1
}

JWT_SECRET=$(generate_secret)
MONGO_PASSWORD=$(generate_secret | tr -dc 'a-zA-Z0-9' | head -c 24)

# Create .env file with detected IP
cat > .env << ENVFILE
# ===========================================
# CLURST - Docker Environment Variables
# Auto-generated on $(date)
# Server IP: ${VPS_IP}
# ===========================================

# -------------------------------------------
# MongoDB Configuration (for Docker)
# -------------------------------------------
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=${MONGO_PASSWORD}

# -------------------------------------------
# Backend Configuration
# -------------------------------------------
NODE_ENV=${MODE}
PORT=8000

# JWT Authentication
JWT_SECRET=${JWT_SECRET}
SALT_ROUNDS=10

# URLs - Configured for IP: ${VPS_IP}
FRONTEND_ORIGINS=http://${VPS_IP}:5173,http://${VPS_IP},http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://frontend:80
FRONTEND_URL=http://${VPS_IP}
APP_URL=http://${VPS_IP}
APP_NAME=Clurst

# Firebase Admin SDK (REPLACE WITH YOUR VALUES)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Google OAuth (REPLACE WITH YOUR VALUES)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://${VPS_IP}:8000/auth/google/google-callback

# Email SMTP (REPLACE WITH YOUR VALUES)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# Twilio SMS (REPLACE WITH YOUR VALUES)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Stripe (REPLACE WITH YOUR VALUES)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Gemini AI (REPLACE WITH YOUR VALUE)
GEMINI_API_KEY=your-gemini-api-key

# -------------------------------------------
# Frontend Configuration (Build-time)
# -------------------------------------------
VITE_API_BASE=http://${VPS_IP}:8000
VITE_FRONTEND_URL=http://${VPS_IP}
VITE_GEMINI_API_KEY=your-gemini-api-key

VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key

# Firebase Client Configuration (REPLACE WITH YOUR VALUES)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

ENVFILE

print_success ".env file created with IP: ${VPS_IP}"

# ==========================================
# Step 3: Create .env with actual values if .env.secrets exists
# ==========================================
if [ -f ".env.secrets" ]; then
    print_info "Found .env.secrets - merging with .env..."

    # Read secrets and update .env
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ $key =~ ^#.*$ ]] && continue
        [[ -z "$key" ]] && continue

        # Update the key in .env if it exists
        if grep -q "^${key}=" .env; then
            sed -i "s|^${key}=.*|${key}=${value}|" .env
        else
            echo "${key}=${value}" >> .env
        fi
    done < .env.secrets

    print_success "Secrets merged into .env"
fi

# ==========================================
# Step 4: Set permissions
# ==========================================
print_header "Step 3: Setting Permissions"

chmod +x deploy.sh 2>/dev/null || true
chmod +x setup.sh
chmod 600 .env

print_success "Permissions set correctly"

# ==========================================
# Step 5: Create data directories
# ==========================================
print_header "Step 4: Creating Data Directories"

mkdir -p data/mongodb
mkdir -p logs

print_success "Data directories created"

# ==========================================
# Step 6: Build and Start
# ==========================================
print_header "Step 5: Building and Starting Services"

if [ "$MODE" = "dev" ]; then
    print_info "Starting in DEVELOPMENT mode..."
    docker compose -f docker-compose.dev.yml up --build -d
else
    print_info "Starting in PRODUCTION mode..."
    docker compose up --build -d
fi

# ==========================================
# Step 7: Health Check
# ==========================================
print_header "Step 6: Running Health Checks"

print_info "Waiting for services to start..."
sleep 10

# Check MongoDB
if docker compose ps | grep -q "mongodb.*running\|mongodb.*Up"; then
    print_success "MongoDB is running"
else
    print_warning "MongoDB may still be starting..."
fi

# Check Backend
if docker compose ps | grep -q "backend.*running\|backend.*Up"; then
    print_success "Backend is running"
else
    print_warning "Backend may still be starting..."
fi

# Check Frontend
if docker compose ps | grep -q "frontend.*running\|frontend.*Up"; then
    print_success "Frontend is running"
else
    print_warning "Frontend may still be starting..."
fi

# ==========================================
# Final Summary
# ==========================================
print_header "🎉 Setup Complete!"

echo -e "${GREEN}"
echo "============================================="
echo "  CLURST is now running!"
echo "============================================="
echo ""
echo "  🌐 Frontend:  http://${VPS_IP}"
echo "  🔌 Backend:   http://${VPS_IP}:8000"
echo "  📊 API Docs:  http://${VPS_IP}:8000/api"
echo ""
echo "============================================="
echo -e "${NC}"

echo ""
print_warning "IMPORTANT: Edit .env file with your actual API keys!"
echo "  nano .env"
echo ""
print_info "Useful Commands:"
echo "  View logs:    docker compose logs -f"
echo "  Stop:         docker compose down"
echo "  Restart:      docker compose restart"
echo "  Status:       docker compose ps"
echo ""
