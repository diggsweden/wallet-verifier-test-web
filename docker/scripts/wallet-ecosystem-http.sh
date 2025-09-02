#!/bin/bash
set -e

# wallet-ecosystem-http.sh - Development environment setup
#
# Clones external repositories, applies local configuration overlays,
# and starts all services for local development.
#
# Usage: ./wallet-ecosystem-http.sh [--app-wallet|--web-wallet]
#   --app-wallet (default): Use docker-compose-app.yml (uses pre-built image)
#   --web-wallet: Use docker-compose.yml (builds from source)

# Setup
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(dirname "$SCRIPT_DIR")"

# Parse command line arguments
COMPOSE_FILE="docker-compose-app.yml" # Default to app-wallet
while [[ $# -gt 0 ]]; do
  case $1 in
  --app-wallet)
    COMPOSE_FILE="docker-compose-app.yml"
    shift
    ;;
  --web-wallet)
    COMPOSE_FILE="docker-compose.yml"
    shift
    ;;
  *)
    echo "Unknown option $1"
    echo "Usage: $0 [--app-wallet|--web-wallet]"
    echo "  --app-wallet (default): Use docker-compose-app.yml (uses pre-built image)"
    echo "  --web-wallet: Use docker-compose.yml (builds from source)"
    exit 1
    ;;
  esac
done

# Color helpers
log() { echo -e "\033[0;34m$1\033[0m"; }
success() { echo -e "\033[0;32m✅ $1\033[0m"; }
warn() { echo -e "\033[1;33m$1\033[0m"; }
error() {
  echo -e "\033[0;31m❌ $1\033[0m"
  exit 1
}

# Generic overlay function
apply_overlays() {
  local src="$1"
  local dest="$2"
  [ -d "$src" ] || return 0

  local orig_dir
  orig_dir="$(pwd)"
  cd "$src"
  find . -type f | while read -r file; do
    file="${file#./}"
    dir="$(dirname "$file")"
    [ "$dir" != "." ] && mkdir -p "$dest/$dir"
    cp "$src/$file" "$dest/$file"
    echo "  Applied: $file"
  done
  cd "$orig_dir"
}

# Setup hosts if needed
HOSTS=("wallet-frontend" "wallet-backend-server" "wallet-enterprise-issuer" "wallet-enterprise-acme-verifier")
missing=()

for host in "${HOSTS[@]}"; do
  grep -q "127\.0\.0\.1[[:space:]]\+$host" /etc/hosts || missing+=("$host")
done

if [ ${#missing[@]} -gt 0 ]; then
  warn "Adding hosts: ${missing[*]}"
  for host in "${missing[@]}"; do
    echo "127.0.0.1 $host" | sudo tee -a /etc/hosts >/dev/null
  done
fi
success "Hosts configured"

# Only setup wallet ecosystem for --web-wallet
if [ "$COMPOSE_FILE" = "docker-compose.yml" ]; then
  # Clone or update wallet ecosystem
  if [ ! -d "$DOCKER_DIR/wallet-ecosystem" ]; then
    log "Cloning wallet-ecosystem..."
    cd "$DOCKER_DIR"
    git clone https://github.com/wwWallet/wallet-ecosystem.git
  fi

  cd "$DOCKER_DIR/wallet-ecosystem"
  log "Starting wallet ecosystem..."
  git reset --hard HEAD && git clean -fd
  git fetch --prune
  # Pin to stable version
  git checkout v0.3.0
  git submodule foreach --recursive 'git reset --hard HEAD && git clean -fd'
  git submodule update --init --remote --recursive

  log "Applying wallet overlays..."
  apply_overlays "$DOCKER_DIR/config/wallet-ecosystem" "$DOCKER_DIR/wallet-ecosystem"

  # Copy .env file to wallet-ecosystem if it exists
  if [ -f "$DOCKER_DIR/.env" ]; then
    log "Copying environment configuration to wallet-ecosystem..."
    cp "$DOCKER_DIR/.env" "$DOCKER_DIR/wallet-ecosystem/.env"
  fi

  if [ ! -f "wallet-frontend/.env" ]; then
    log "Copying wallet-frontend template environment configuration..."
    cp "wallet-frontend/.env.template" "wallet-frontend/.env"
  fi

  node ecosystem.js up -d || warn "Some wallet services failed to start, continuing anyway"
  node ecosystem.js init || warn "Initialization had errors, continuing anyway"
else
  log "Skipping wallet-ecosystem setup for --app-wallet (using pre-built images)"
fi

# Only setup EUDI verifier source for --web-wallet (builds from source)
if [ "$COMPOSE_FILE" = "docker-compose.yml" ]; then
  # Clone or update EUDI verifier if needed
  if [ ! -d "$DOCKER_DIR/eudi-srv-web-verifier-endpoint-23220-4-kt" ]; then
    log "Cloning EUDI verifier..."
    cd "$DOCKER_DIR"
    git clone https://github.com/eu-digital-identity-wallet/eudi-srv-web-verifier-endpoint-23220-4-kt.git
  fi

  if [ -d "$DOCKER_DIR/eudi-srv-web-verifier-endpoint-23220-4-kt" ]; then
    cd "$DOCKER_DIR/eudi-srv-web-verifier-endpoint-23220-4-kt"
    git reset --hard HEAD && git clean -fd
    # Pin to stable version
    git checkout v0.6.0
    log "Applying EUDI overlays..."
    apply_overlays "$DOCKER_DIR/config/eudi-verifier" "$DOCKER_DIR/eudi-srv-web-verifier-endpoint-23220-4-kt"
  fi
else
  log "Skipping EUDI verifier source setup for --app-wallet (using pre-built image)"
fi

# Start EUDI verifier
cd "$DOCKER_DIR"
log "Starting EUDI verifier using $COMPOSE_FILE..."

# Show which WALLET_URL will be used
if [ "$COMPOSE_FILE" = "docker-compose.yml" ]; then
  log "WALLET_URL will be set to: http://localhost:3000/cb"
else
  log "WALLET_URL will be set to: eudi-openid4vp://"
fi

docker compose -f "$COMPOSE_FILE" up -d --build --force-recreate

success "All services started"
sleep 20

log "📊 System Status"
echo ""

# Define services with their URLs and health endpoints
declare -a services=(
  "Wallet|http://localhost:3000/|/"
  "Wallet Backend|http://localhost:8002/|/health"
  "Issuer|http://localhost:8003/|/"
  "Custom Verifier|http://localhost:3002/|/"
  "EUDI Backend|http://localhost:8080/|/ui/"
)

# Check and display each service
for service in "${services[@]}"; do
  IFS='|' read -r name url health <<<"$service"
  if curl -s "${url}${health#/}" &>/dev/null; then
    echo -e "  \033[0;32m✅\033[0m $url - $name"
  else
    echo -e "  \033[1;33m⚠️\033[0m  $url - $name (not ready)"
  fi
done

success "Ready for testing!"
