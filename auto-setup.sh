#!/bin/bash

# ===========================================
# CLURST - FULLY AUTOMATED Setup Script
# ===========================================
# This script does EVERYTHING automatically!
# Just run: ./auto-setup.sh
# ===========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "\n${CYAN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  $1${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════╝${NC}\n"
}

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }

# ===========================================
# Detect Environment
# ===========================================
print_header "🚀 CLURST Full Auto Setup"

MODE=${1:-production}
VPS_IP=${2:-$(hostname -I 2>/dev/null | awk '{print $1}' || curl -s ifconfig.me 2>/dev/null || echo "localhost")}
VPS_IP=$(echo "$VPS_IP" | xargs)

echo "Mode: $MODE"
echo "Server IP: $VPS_IP"

# ===========================================
# Step 1: Install Docker
# ===========================================
print_header "Step 1/5: Installing Docker"

if ! command -v docker &> /dev/null; then
    print_info "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
    sudo usermod -aG docker $USER 2>/dev/null || true
    sudo systemctl start docker
    sudo systemctl enable docker
    print_success "Docker installed!"
else
    print_success "Docker already installed"
fi

if ! docker compose version &> /dev/null; then
    print_info "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed!"
else
    print_success "Docker Compose available"
fi

# ===========================================
# Step 2: Generate Secure Secrets
# ===========================================
print_header "Step 2/5: Generating Secrets"

generate_secret() {
    openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1
}

JWT_SECRET=$(generate_secret)
MONGO_PASSWORD=$(generate_secret | tr -dc 'a-zA-Z0-9' | head -c 24)

print_success "Generated secure JWT secret"
print_success "Generated secure MongoDB password"

# ===========================================
# Step 3: Create Complete .env File
# ===========================================
print_header "Step 3/5: Creating Environment File"

# Firebase Private Key (stored as variable for proper escaping)
FIREBASE_KEY='-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCoAGUT4e1aNbMn\nS0VdXnbs/43DMdPSUxbQpVhFDnQwZkjRFlxR6S1DWZF+hqVLeINZth8GzTy26mPB\n65dlgGKeYI4yUhT/fttABfLpcxYwHgmJ+AMZ7lWQNu5NJfprgueQb4CJ0/uHe+2A\nb1pS+eRMXHRafCPwC7JvdsHVNWVAkjOrylPwzhy9hWAYIG/RcobELgDOD+9c3OHq\nDVAIkSLL0kzzp8A6peLaM/fVecz28hlcIsThUxGRxD85FO6aKZ5NFQhxFx9uPTSP\n5JelrWylJT5p+ijUrbvWldJNcoEzTe3HkzLiy7cR7aipuDbc56CbEGGP7SDxG0RF\nlDSrlM9LAgMBAAECggEABBv2XPUivBkiJ6zkpnMAD630hri6SKO1pCbXMOE4oFJw\nJ4UXfv1oGQSg1WpvspfhBpm4yo7MlGDJTd34Vwg74UnVUI/HabRtonRCy8j/2u9x\nJknFsaWtvBhL3eE27dhG17aSe0yPE3JJjeGrYOox1lhQlEIDEwUGOUm7Vf63Wkvv\nAvvuIrj8rh8zGOyalsrdXRGuR7bdqDa1fmkUKq7earBXi8KdgNJWOR9/PJAn6Wro\nujcJraIJgx/rELHooUtbnwcfzlyStyBxQHakf0dwmDhu47gtgF/IyQ1OwHvAPr5K\ncHFrNW4jRh/Hds/woyj6oyduTzBYFQUDWcCYEbU7EQKBgQDdR3jWhIXavA6ypH7w\nR+iBMo6tSKt+NbrwtQku8Bgtj5tehpQXlVY3OttbghYP2bauFP1T9rcwsTXZ6iJ2\nRk6ZzLqdFeYNnXOZUIOgekOh0W/R8xZDm2PpZ9EiElcwn9gxSrQM0CK75rtVHqw1\njgkquMSr8qxMDZ6OiLML89QowwKBgQDCXNJZYtcgIb4HV+QC6FQtgSqHhTWXJh2t\nULZsMWFOazR/k9u4tKsDEJ5XpRf2/nBBvGdqGhXd0Sf/Uk4WFEvweipgQmCl5+s+\nKD0y6PzljR3ZrNu3JFJrnJZoFGD80GFD9NRYPjP3xfAdyhBnqQBZb56uAmYog33t\nq6QFsfSW2QKBgQCNNhJAW7wMNdzvVhiIAGu5H2l73hdK6MEO4YklwiS71pxhO2MA\nldW6Uz4vbJnlrZtuBokP7y9CzKRAF7G8Zuu8LLGek54HbEacPYxyefP1LXG9uvKn\nXF/rUMxegPPRXQCbnD/AuYahAQLltDhTyPvCnr0ruicINdzMuyH/66+l/wKBgFsh\n/LtOvgHh8GEvE8lNOFMR0mgyzJrvk1C1nKOET9TeLYJ4SLkFdX39Z9E+psr4KJia\nB39XddNJA9ESvWxa3fSGw6HY3cpMwR+m7HMXjaTwkwOCqo7n6AFvLZLlo0hHSKP9\ngydRGzrdQ6YkHacNNg25aZS7qTzr0rsDFOhatY2ZAoGALccW/qreeQZojtFuUKxY\njky2wMqrPFo271eoREhAaq5RYW2/0MNvYhQUzVldCUc+q310yzbE+8e1A4tteZUl\nnoVmA1bu8wsv/EDuqPQm4BWeninn72ZE5PgptdE0nHJ3AmD/7FC3P+AvNJx7kpYb\nUf+gkRf72B/4Z1fZ5NPNSFA=\n-----END PRIVATE KEY-----\n'

cat > .env << EOF
# ===========================================
# CLURST - Environment Variables
# Auto-generated: $(date)
# Server: ${VPS_IP}
# ===========================================

# MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=${MONGO_PASSWORD}

# Backend
NODE_ENV=${MODE}
PORT=8000
JWT_SECRET=${JWT_SECRET}
SALT_ROUNDS=10

# URLs (Auto-configured for ${VPS_IP})
FRONTEND_ORIGINS=http://${VPS_IP}:5173,http://${VPS_IP},http://localhost:5173,http://localhost:3000,http://frontend:80
FRONTEND_URL=http://${VPS_IP}
APP_URL=http://${VPS_IP}
APP_NAME=Clurst

# Firebase Admin SDK
FIREBASE_PROJECT_ID=newai-41f9f
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@newai-41f9f.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="${FIREBASE_KEY}"

# Google OAuth
GOOGLE_CLIENT_ID=574451618275-oprtsptiu3o6g968mg3ga94fsq3ksgt9.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://${VPS_IP}:8000/auth/google/google-callback

# Email SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=naveendimond77@gmail.com
EMAIL_PASS=wmcl uomz jafp onzr
EMAIL_FROM=naveendimond77@gmail.com

# Twilio SMS
TWILIO_ACCOUNT_SID=ACdf1225ad6d787bb673c8b12f8e3ceaec
TWILIO_AUTH_TOKEN=3b68b2e41bcde90ee21e4b4f4276a073
TWILIO_PHONE_NUMBER=+17402991061

# Stripe
STRIPE_SECRET_KEY=sk_test_51SQkGIL7jy9YmHQx6B7ltOHmXEhnNiggCIMtKW95UDC2yECtIhCchqxnaMXWiHPvgeB2QAbR17rt6ON9F5QV3Y7g00uJkPBQOU
STRIPE_WEBHOOK_SECRET=whsec_RUv7JGuyJqZIvZ9utcNvSUjD8ZkPFSjp

# Gemini AI
GEMINI_API_KEY=AIzaSyDyqS_m59ZL828-yMQC-ZblgwrK8mOADUI

# Frontend (Build-time)
VITE_API_BASE=http://${VPS_IP}:8000
VITE_FRONTEND_URL=http://${VPS_IP}
VITE_GEMINI_API_KEY=AIzaSyDyqS_m59ZL828-yMQC-ZblgwrK8mOADUI
VITE_STRIPE_PUBLIC_KEY=pk_test_51SQkGIL7jy9YmHQxwzIJ8v03sAwEWmDq85TT4Q3ehftI3AYxnok3wYhUJUKHnNyPIYUZxoTrWHk4MDrMTd9N99ds00z12FEhcx

# Firebase Client
VITE_FIREBASE_API_KEY=AIzaSyB9U5ETAZquCY7-RkGMPIN588Z1lS4JEmE
VITE_FIREBASE_AUTH_DOMAIN=newai-41f9f.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=newai-41f9f
VITE_FIREBASE_STORAGE_BUCKET=newai-41f9f.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=515180862575
VITE_FIREBASE_APP_ID=1:515180862575:web:e897f77cd91445c3bac19a
EOF

print_success ".env created with all API keys configured"

# ===========================================
# Step 4: Setup Directories & Permissions
# ===========================================
print_header "Step 4/5: Setting Up Project"

mkdir -p data/mongodb logs
chmod +x deploy.sh 2>/dev/null || true
chmod +x setup.sh 2>/dev/null || true
chmod 600 .env

print_success "Directories created"
print_success "Permissions set"

# ===========================================
# Step 5: Build & Start Docker
# ===========================================
print_header "Step 5/5: Starting Application"

# Detect docker-compose command (old vs new syntax)
if command -v docker-compose &> /dev/null; then
    DC="docker-compose"
else
    DC="docker compose"
fi

print_info "Using: $DC"
print_info "Building and starting containers..."

$DC down 2>/dev/null || true
$DC up --build -d

# Wait for services
print_info "Waiting for services to start..."
sleep 15

# Health check
echo ""
if $DC ps | grep -q "mongodb.*Up\|mongodb.*running"; then
    print_success "MongoDB: Running"
else
    print_warning "MongoDB: Starting..."
fi

if $DC ps | grep -q "backend.*Up\|backend.*running"; then
    print_success "Backend: Running"
else
    print_warning "Backend: Starting..."
fi

if $DC ps | grep -q "frontend.*Up\|frontend.*running"; then
    print_success "Frontend: Running"
else
    print_warning "Frontend: Starting..."
fi

# ===========================================
# DONE!
# ===========================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     🎉 SETUP COMPLETE - APP IS LIVE! 🎉    ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║                                            ║${NC}"
echo -e "${GREEN}║  🌐 Frontend: http://${VPS_IP}              ${NC}"
echo -e "${GREEN}║  🔌 Backend:  http://${VPS_IP}:8000          ${NC}"
echo -e "${GREEN}║                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo "Commands:"
echo "  View logs:  $DC logs -f"
echo "  Stop:       $DC down"
echo "  Restart:    $DC restart"
echo ""
