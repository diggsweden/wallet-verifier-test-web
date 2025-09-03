#!/bin/bash
set -e

DOCKER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KEYSTORE_PATH="$DOCKER_DIR/keystore-p256.jks"

error() {
  echo -e "\033[0;31m$1\033[0m"
  exit 1
}
log() { echo -e "\033[0;34m$1\033[0m"; }

# Get or start ngrok tunnel
get_ngrok_url() {
  curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[] | select(.config.addr == "http://localhost:8000") | .public_url' 2>/dev/null
}

NGROK_URL=$(get_ngrok_url)
if [[ -n "$NGROK_URL" ]]; then
  log "Using existing ngrok tunnel: $NGROK_URL"
else
  log "Starting ngrok tunnel..."
  pkill -f "ngrok.*8000" || true
  ngrok http 8000 >/dev/null 2>&1 &
  sleep 5

  NGROK_URL=$(get_ngrok_url)
  [[ -z "$NGROK_URL" ]] && error "Failed to start ngrok tunnel"

  trap 'pkill -f "ngrok.*8000" || true' EXIT
fi

# Update keystore with ngrok hostname
HOSTNAME=$(echo "$NGROK_URL" | sed 's|https://||')
log "Updating keystore with hostname: $HOSTNAME"

wget -q "https://github.com/eu-digital-identity-wallet/eudi-srv-web-verifier-endpoint-23220-4-kt/raw/refs/heads/main/src/main/resources/keystore.jks" -O "$KEYSTORE_PATH" || error "Failed to download keystore"

keytool -delete -alias verifier -keystore "$KEYSTORE_PATH" -storepass keystore 2>/dev/null || true
keytool -genkeypair -alias verifier -keyalg EC -groupname secp256r1 -sigalg SHA256withECDSA -validity 3650 -keystore "$KEYSTORE_PATH" -storepass keystore -keypass keystore -dname "CN=verifier" -ext "SAN=DNS:localhost,DNS:verifier,DNS:eudi-verifier-backend,DNS:$HOSTNAME" 2>/dev/null

# Create .env file
cat >"$DOCKER_DIR/.env" <<EOF
VERIFIER_PUBLICURL=$NGROK_URL/backend
HOST_API=$NGROK_URL/backend
VERIFIER_ORIGINALCLIENTID=$HOSTNAME
NGROK_URL=$NGROK_URL
EOF

log "Starting docker services with rebuild..."
docker compose -f "$DOCKER_DIR/docker-compose.yml" up -d --build --force-recreate

echo "✅ Services running at: $NGROK_URL"
echo "Press Ctrl+C to stop..."
trap 'docker compose -f "$DOCKER_DIR/docker-compose.yml" down; exit' INT
while true; do sleep 1; done
