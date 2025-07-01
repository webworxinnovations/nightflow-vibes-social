
#!/bin/bash

echo "🔒 Quick SSL Setup for NightFlow Droplet"
echo "📍 Droplet IP: 67.205.179.77"

# Create SSL directories
sudo mkdir -p /etc/ssl/private
sudo mkdir -p /etc/ssl/certs

echo ""
echo "🔧 Generating self-signed SSL certificate..."
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/server.key \
  -out /etc/ssl/certs/server.crt \
  -subj "/C=US/ST=State/L=City/O=NightFlow/CN=67.205.179.77"

# Set permissions
sudo chmod 600 /etc/ssl/private/server.key
sudo chmod 644 /etc/ssl/certs/server.crt

echo ""
echo "🔧 Updating environment variables..."
cd /var/www/nightflow-server

# Update .env file
echo "SSL_ENABLED=true" >> .env
echo "HTTPS_PORT=3443" >> .env
echo "SSL_CERT_PATH=/etc/ssl/certs/server.crt" >> .env
echo "SSL_KEY_PATH=/etc/ssl/private/server.key" >> .env

echo ""
echo "🚀 Restarting server with HTTPS support..."
pm2 restart nightflow-server

echo ""
echo "✅ SSL setup complete!"
echo "🔗 HTTPS API: https://67.205.179.77:3443"
echo "🔗 HTTP API: http://67.205.179.77:3001"
echo ""
echo "🧪 Test HTTPS:"
echo "curl -k https://67.205.179.77:3443/health"
echo ""
echo "⚠️  Note: Self-signed certificates will show browser warnings"
echo "💡 For production, use Let's Encrypt or a proper SSL certificate"
