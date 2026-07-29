#!/bin/bash
# ============================================================
# Build the app and start/restart it with PM2
# Run from the repo root:  bash deploy/build-and-start.sh
# ============================================================
set -e

REPO_DIR="/var/www/atv-site"
cd "$REPO_DIR"

# Load .env so DATABASE_URL is available for the DB migration
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "ERROR: .env file not found at $REPO_DIR/.env"
  echo "Create it first — see deploy/setup-server.sh for the required values."
  exit 1
fi

echo "=== [1/4] Installing dependencies ==="
pnpm install --frozen-lockfile

echo "=== [2/4] Running database migration ==="
pnpm --filter @workspace/db run push

echo "=== [3/4] Building frontend ==="
# BASE_PATH=/ tells the frontend it's served from the site root
PORT=3000 BASE_PATH=/ NODE_ENV=production \
  pnpm --filter @workspace/atv-buyer run build

echo "=== [4/4] Building and starting API server ==="
pnpm --filter @workspace/api-server run build

# Start or restart with PM2
pm2 describe atv-api > /dev/null 2>&1 && \
  pm2 restart atv-api || \
  pm2 start \
    --name atv-api \
    --interpreter node \
    --node-args="--enable-source-maps" \
    "$REPO_DIR/artifacts/api-server/dist/index.mjs"

pm2 save

echo ""
echo "=== Done! ==="
echo "API server is running on port $PORT (internally)"
echo "Run 'pm2 logs atv-api' to watch live logs"
echo "Run 'pm2 status' to check process health"
