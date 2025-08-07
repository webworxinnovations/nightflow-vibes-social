#!/bin/bash

echo "🔒 Setting up NightFlow for HTTPS-Only Streaming"
echo "📍 This will configure your droplet to serve everything over HTTPS"

# Stop all existing servers
echo "🛑 Stopping all existing servers..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Kill any processes using our ports
echo "🧹 Clearing ports..."
sudo fuser -k 1935/tcp 2>/dev/null || true
sudo fuser -k 3443/tcp 2>/dev/null || true
sudo fuser -k 9001/tcp 2>/dev/null || true
sudo fuser -k 3001/tcp 2>/dev/null || true

# Setup SSL certificates if they don't exist
echo "🔧 Checking SSL certificates..."
if [ ! -f "/etc/ssl/certs/server.crt" ] || [ ! -f "/etc/ssl/private/server.key" ]; then
    echo "🔧 Setting up SSL certificates..."
    sudo ./setup-ssl-quick.sh
    if [ $? -ne 0 ]; then
        echo "❌ SSL setup failed!"
        exit 1
    fi
else
    echo "✅ SSL certificates found"
fi

# Make scripts executable
chmod +x *.sh
chmod +x https-streaming-server.js

# Create media directory
sudo mkdir -p /tmp/media/live
sudo chmod 755 /tmp/media
sudo chmod 755 /tmp/media/live

# Update environment variables for HTTPS-only
echo "🔧 Updating environment for HTTPS-only..."
echo "SSL_ENABLED=true" > .env.production
echo "HTTPS_PORT=3443" >> .env.production
echo "SSL_CERT_PATH=/etc/ssl/certs/server.crt" >> .env.production
echo "SSL_KEY_PATH=/etc/ssl/private/server.key" >> .env.production
echo "MEDIA_ROOT=/tmp/media" >> .env.production

# Test SSL certificates
echo "🧪 Testing SSL certificates..."
if openssl x509 -in /etc/ssl/certs/server.crt -text -noout > /dev/null 2>&1; then
    echo "✅ SSL certificate is valid"
else
    echo "❌ SSL certificate is invalid!"
    exit 1
fi

echo ""
echo "✅ HTTPS streaming setup complete!"
echo ""
echo "🚀 To start the HTTPS-only server, run:"
echo "   ./start-https-only.sh"
echo ""
echo "🎯 This will provide:"
echo "   • RTMP input on port 1935 (for OBS)"
echo "   • HTTPS API on port 3443"
echo "   • HTTPS HLS streaming on port 3443"
echo "   • No HTTP servers running"
echo ""
echo "✅ Compatible with Lovable and all HTTPS environments!"