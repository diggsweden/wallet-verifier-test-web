#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
KEYSTORE_PATH="$DOCKER_DIR/docker/config/certs/keystore-p256.jks"
COMPOSE_FILE="docker-compose.yml"

RUN_ECOSYSTEM=false
while [[ $# -gt 0 ]]; do
  case $1 in
  --run-ecosystem)
    RUN_ECOSYSTEM=true
    shift
    ;;
  --app-wallet)
    COMPOSE_FILE="docker-compose-app.yml"
    shift
    ;;
  --web-wallet)
    COMPOSE_FILE="docker-compose.yml"
    shift
    ;;
  -h|--help)
    echo "Usage: $0 [--run-ecosystem] [--app-wallet|--web-wallet]"
    echo "  --run-ecosystem: Run wallet-ecosystem-http.sh after ngrok setup"
    echo "  --app-wallet: Use docker-compose-app.yml"
    echo "  --web-wallet: Use docker-compose.yml (default)"
    exit 0
    ;;
  *)
    echo "Unknown option $1"
    echo "Usage: $0 [--run-ecosystem] [--app-wallet|--web-wallet]"
    exit 1
    ;;
  esac
done

log() { echo -e "\033[0;34m$1\033[0m"; }
success() { echo -e "\033[0;32m$1\033[0m"; }
warn() { echo -e "\033[1;33m$1\033[0m"; }
error() {
  echo -e "\033[0;31m$1\033[0m"
  exit 1
}

if ! command -v ngrok &> /dev/null; then
  error "ngrok is not installed. Please install ngrok first: https://ngrok.com/download"
fi

if ! command -v keytool &> /dev/null; then
  error "keytool is not installed. Please install Java JDK."
fi

log "Starting ngrok tunnel on port 8000..."
pkill -f "ngrok.*8000" || true
sleep 2

ngrok http 8000 --log=stdout > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

cleanup() {
  log "Cleaning up..."
  kill $NGROK_PID 2>/dev/null || true
  pkill -f "ngrok.*8000" || true
}
trap cleanup EXIT
sleep 5

NGROK_URL=""
for i in {1..30}; do
  if NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url // empty' 2>/dev/null) && [[ -n "$NGROK_URL" ]]; then
    break
  fi
  sleep 1
done

if [[ -z "$NGROK_URL" ]]; then
  error "Failed to get ngrok URL. Check if ngrok started properly."
fi

HOSTNAME=$(echo "$NGROK_URL" | sed 's|https://||' | sed 's|http://||')
ORIGINAL_KEYSTORE="$DOCKER_DIR/eudi-srv-web-verifier-endpoint-23220-4-kt/src/main/resources/keystore.jks"

log "Updating keystore with hostname: $HOSTNAME"

if [[ -f "$ORIGINAL_KEYSTORE" ]]; then
  cp "$ORIGINAL_KEYSTORE" "$KEYSTORE_PATH"
else
  error "Original keystore not found at: $ORIGINAL_KEYSTORE"
fi

keytool -delete -alias verifier -keystore "$KEYSTORE_PATH" -storepass keystore 2>/dev/null || true

keytool -genkeypair \
  -alias verifier \
  -keyalg EC \
  -groupname secp256r1 \
  -sigalg SHA256withECDSA \
  -validity 3650 \
  -keystore "$KEYSTORE_PATH" \
  -storepass keystore \
  -keypass keystore \
  -dname "CN=verifier" \
  -ext "SAN=DNS:localhost,DNS:verifier,DNS:eudi-verifier-backend,DNS:$HOSTNAME" \
  2>/dev/null

ENV_FILE="$DOCKER_DIR/.env"

cat > "$ENV_FILE" << EOF
VERIFIER_PUBLICURL=$NGROK_URL/backend
HOST_API=$NGROK_URL/backend
VERIFIER_ORIGINALCLIENTID=$HOSTNAME
NGROK_URL=$NGROK_URL
EOF

success "Setup complete"
echo "Ngrok tunnel: $NGROK_URL"

if [[ "$RUN_ECOSYSTEM" == "true" ]]; then
  if [[ "$COMPOSE_FILE" == "docker-compose-app.yml" ]]; then
    exec "$DOCKER_DIR/scripts/wallet-ecosystem-http.sh" --app-wallet
  else
    exec "$DOCKER_DIR/scripts/wallet-ecosystem-http.sh" --web-wallet
  fi
else
  log "Starting docker services..."
  cd "$DOCKER_DIR" && docker compose -f "$COMPOSE_FILE" up -d
  echo "Services started. Press Ctrl+C to stop ngrok tunnel..."
  wait $NGROK_PID
fi