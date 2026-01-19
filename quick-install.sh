#!/bin/bash

# ===========================================
# CLURST - One-Line VPS Quick Setup
# ===========================================
# Run this on your VPS after cloning:
#   curl -sSL https://raw.githubusercontent.com/sahilmyadav/aiclurstseo/main/quick-install.sh | bash
#
# Or locally:
#   ./quick-install.sh [YOUR_VPS_IP]
# ===========================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════╗"
echo "║     🚀 CLURST Quick Install Script        ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"

# Get IP
VPS_IP=${1:-$(hostname -I 2>/dev/null | awk '{print $1}' || curl -s ifconfig.me)}
VPS_IP=$(echo "$VPS_IP" | xargs)

echo "Detected IP: $VPS_IP"

# Check if we're in the project directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${YELLOW}Not in project directory. Looking for aiclurstseo...${NC}"

    if [ -d "aiclurstseo" ]; then
        cd aiclurstseo
    elif [ -d "$HOME/aiclurstseo" ]; then
        cd $HOME/aiclurstseo
    else
        echo "Cloning repository..."
        git clone https://github.com/sahilmyadav/aiclurstseo.git
        cd aiclurstseo
    fi
fi

echo ""
echo "Step 1: Making scripts executable..."
chmod +x setup.sh 2>/dev/null || true
chmod +x deploy.sh 2>/dev/null || true

echo "Step 2: Running full setup..."
./setup.sh prod $VPS_IP

echo ""
echo -e "${GREEN}✓ Installation complete!${NC}"
echo ""
echo "Your app is running at:"
echo "  🌐 http://$VPS_IP"
echo ""
