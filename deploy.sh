#!/bin/bash

# ===========================================
# Clurst - Docker Deployment Script
# ===========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored message
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    print_success "Docker and Docker Compose are installed"
}

# Check if .env file exists
check_env() {
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_warning "Please edit .env file with your actual values before continuing."
            exit 1
        else
            print_error ".env.example not found. Please create .env file manually."
            exit 1
        fi
    fi
    print_success ".env file found"
}

# Development mode
dev() {
    print_status "Starting development environment..."
    docker compose -f docker-compose.dev.yml up --build
}

# Development mode (detached)
dev_detached() {
    print_status "Starting development environment (detached)..."
    docker compose -f docker-compose.dev.yml up --build -d
    print_success "Development environment started in background"
    print_status "View logs with: ./deploy.sh logs-dev"
}

# Production mode (without SSL)
prod() {
    print_status "Starting production environment..."
    docker compose up --build -d
    print_success "Production environment started"
    print_status "View logs with: ./deploy.sh logs"
}

# Production mode with SSL
prod_ssl() {
    print_status "Starting production environment with SSL..."
    docker compose --profile production up --build -d
    print_success "Production environment with SSL started"
}

# Stop all containers
stop() {
    print_status "Stopping all containers..."
    docker compose down
    docker compose -f docker-compose.dev.yml down 2>/dev/null || true
    print_success "All containers stopped"
}

# Stop and remove volumes
clean() {
    print_warning "This will remove all containers and volumes (including database data)!"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker compose down -v
        docker compose -f docker-compose.dev.yml down -v 2>/dev/null || true
        print_success "All containers and volumes removed"
    else
        print_status "Cancelled"
    fi
}

# View logs
logs() {
    docker compose logs -f
}

# View development logs
logs_dev() {
    docker compose -f docker-compose.dev.yml logs -f
}

# View specific service logs
logs_service() {
    if [ -z "$1" ]; then
        print_error "Please specify a service name (mongodb, backend, frontend, nginx)"
        exit 1
    fi
    docker compose logs -f "$1"
}

# Rebuild specific service
rebuild() {
    if [ -z "$1" ]; then
        print_error "Please specify a service name (mongodb, backend, frontend, nginx)"
        exit 1
    fi
    print_status "Rebuilding $1..."
    docker compose up --build -d "$1"
    print_success "$1 rebuilt and restarted"
}

# Status of containers
status() {
    print_status "Container status:"
    docker compose ps
}

# Initialize SSL certificates
init_ssl() {
    DOMAIN=${1:-yourdomain.com}
    EMAIL=${2:-admin@yourdomain.com}

    print_status "Initializing SSL certificates for $DOMAIN..."

    # Create directories
    mkdir -p certbot/conf certbot/www nginx/ssl

    # Get certificates using certbot
    docker run --rm \
        -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
        -v "$(pwd)/certbot/www:/var/www/certbot" \
        certbot/certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        -d "$DOMAIN" \
        -d "www.$DOMAIN"

    print_success "SSL certificates obtained for $DOMAIN"
}

# Backup MongoDB
backup() {
    BACKUP_DIR="./backups"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/mongodb_backup_$TIMESTAMP.gz"

    mkdir -p "$BACKUP_DIR"

    print_status "Creating MongoDB backup..."
    docker compose exec mongodb mongodump --archive --gzip | cat > "$BACKUP_FILE"
    print_success "Backup created: $BACKUP_FILE"
}

# Restore MongoDB
restore() {
    if [ -z "$1" ]; then
        print_error "Please specify backup file path"
        exit 1
    fi

    print_warning "This will restore the database from $1"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Restoring MongoDB from $1..."
        cat "$1" | docker compose exec -T mongodb mongorestore --archive --gzip --drop
        print_success "Database restored from $1"
    else
        print_status "Cancelled"
    fi
}

# Shell into container
shell() {
    SERVICE=${1:-backend}
    print_status "Opening shell in $SERVICE container..."
    docker compose exec "$SERVICE" sh
}

# Help
help() {
    echo "Clurst Docker Deployment Script"
    echo ""
    echo "Usage: ./deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  dev             Start development environment (with logs)"
    echo "  dev-d           Start development environment (detached)"
    echo "  prod            Start production environment"
    echo "  prod-ssl        Start production with SSL (requires init-ssl first)"
    echo "  stop            Stop all containers"
    echo "  clean           Stop and remove all containers + volumes"
    echo "  logs            View production logs"
    echo "  logs-dev        View development logs"
    echo "  logs [service]  View logs for specific service"
    echo "  rebuild [svc]   Rebuild and restart specific service"
    echo "  status          Show container status"
    echo "  init-ssl [dom]  Initialize SSL certificates"
    echo "  backup          Create MongoDB backup"
    echo "  restore [file]  Restore MongoDB from backup"
    echo "  shell [service] Open shell in container (default: backend)"
    echo "  help            Show this help message"
}

# Main
check_docker
check_env

case "$1" in
    dev)
        dev
        ;;
    dev-d)
        dev_detached
        ;;
    prod)
        prod
        ;;
    prod-ssl)
        prod_ssl
        ;;
    stop)
        stop
        ;;
    clean)
        clean
        ;;
    logs)
        if [ -n "$2" ]; then
            logs_service "$2"
        else
            logs
        fi
        ;;
    logs-dev)
        logs_dev
        ;;
    rebuild)
        rebuild "$2"
        ;;
    status)
        status
        ;;
    init-ssl)
        init_ssl "$2" "$3"
        ;;
    backup)
        backup
        ;;
    restore)
        restore "$2"
        ;;
    shell)
        shell "$2"
        ;;
    help|--help|-h)
        help
        ;;
    *)
        print_error "Unknown command: $1"
        help
        exit 1
        ;;
esac
