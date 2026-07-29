#!/bin/bash
# ============================================================
# ATV Buyer Site — DigitalOcean Ubuntu 24.04 Setup Script
# Run as root on a fresh droplet:  bash setup-server.sh
# ============================================================
set -e

echo "=== [1/7] System update ==="
apt-get update -y && apt-get upgrade -y

echo "=== [2/7] Install Node.js 22 ==="
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs git

echo "=== [3/7] Install pnpm and PM2 ==="
npm install -g pnpm pm2
pm2 startup systemd -u root --hp /root

echo "=== [4/7] Install PostgreSQL ==="
apt-get install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

echo "=== [5/7] Create database and user ==="
sudo -u postgres psql <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'atvapp') THEN
    CREATE ROLE atvapp WITH LOGIN PASSWORD 'CHANGE_THIS_PASSWORD';
  END IF;
END
$$;
SELECT 'CREATE DATABASE atvbuyer OWNER atvapp'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'atvbuyer')\gexec
SQL

echo "=== [6/7] Install nginx ==="
apt-get install -y nginx
systemctl enable nginx

echo "=== [7/7] Clone repo ==="
mkdir -p /var/www
cd /var/www
if [ -d "atv-site" ]; then
  echo "Repo already exists, pulling latest..."
  cd atv-site && git pull
else
  git clone https://github.com/beaumont409/atc-trader-site.git atv-site
fi

echo ""
echo "=============================================="
echo "  Setup complete!"
echo "=============================================="
echo ""
echo "NEXT: Run the following commands:"
echo ""
echo "  1. Create your .env file:"
echo "       nano /var/www/atv-site/.env"
echo ""
echo "     Paste in:"
echo "       NODE_ENV=production"
echo "       PORT=3001"
echo "       DATABASE_URL=postgresql://atvapp:CHANGE_THIS_PASSWORD@localhost:5432/atvbuyer"
echo "       GMAIL_ADDRESS=chaddubois21@gmail.com"
echo "       GMAIL_APP_PASSWORD=your_16_char_app_password"
echo "       SESSION_SECRET=pick_any_long_random_string_here"
echo ""
echo "  2. Build and start the app:"
echo "       bash /var/www/atv-site/deploy/build-and-start.sh"
echo ""
echo "  3. Configure nginx:"
echo "       bash /var/www/atv-site/deploy/setup-nginx.sh"
echo ""
