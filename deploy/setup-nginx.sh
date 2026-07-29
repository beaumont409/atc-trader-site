#!/bin/bash
# ============================================================
# Configure nginx to serve the ATV site
# Run after build-and-start.sh:  bash deploy/setup-nginx.sh
# ============================================================
set -e

REPO_DIR="/var/www/atv-site"
SERVER_IP=$(curl -s ifconfig.me)

# Write the nginx site config
cat > /etc/nginx/sites-available/atv-site <<NGINX
server {
    listen 80;
    server_name $SERVER_IP _;

    # Serve the React frontend (static files)
    root $REPO_DIR/artifacts/atv-buyer/dist/public;
    index index.html;

    # API requests proxied to Express
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # All other requests go to the React app (SPA routing)
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
NGINX

# Enable the site
ln -sf /etc/nginx/sites-available/atv-site /etc/nginx/sites-enabled/atv-site
rm -f /etc/nginx/sites-enabled/default

# Test and reload
nginx -t && systemctl reload nginx

echo ""
echo "=== nginx configured! ==="
echo "Your site should be live at:  http://$SERVER_IP"
echo ""
echo "To add your domain later, edit /etc/nginx/sites-available/atv-site"
echo "and change 'server_name' to your domain, then run certbot for SSL."
