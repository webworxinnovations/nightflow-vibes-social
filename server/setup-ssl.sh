
#!/bin/bash

# SSL Setup Script for DigitalOcean Droplet
# This script helps you set up SSL certificates for HTTPS support

echo "🔒 Setting up SSL certificates for your DigitalOcean Droplet..."
echo "📍 Droplet IP: 67.205.179.77"

# Create SSL directory
sudo mkdir -p /etc/ssl/private
sudo mkdir -p /etc/ssl/certs

echo ""
echo "Choose SSL certificate option:"
echo "1. Generate self-signed certificate (for testing)"
echo "2. Use Let's Encrypt (requires domain name)"
echo "3. Upload your own certificates"
read -p "Enter your choice (1-3): " choice

case $choice in
  1)
    echo "🔧 Generating self-signed SSL certificate..."
    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout /etc/ssl/private/server.key \
      -out /etc/ssl/certs/server.crt \
      -subj "/C=US/ST=State/L=City/O=Organization/OU=OrgUnit/CN=67.205.179.77"
    
    echo "✅ Self-signed certificate generated!"
    echo "⚠️  Note: Browsers will show security warnings for self-signed certificates"
    ;;
    
  2)
    echo "🌐 Setting up Let's Encrypt certificate..."
    echo "⚠️  You need a domain name pointing to your droplet for Let's Encrypt"
    read -p "Enter your domain name (e.g., yourdomain.com): " domain
    
    # Install certbot
    sudo apt update
    sudo apt install -y certbot
    
    # Generate certificate
    sudo certbot certonly --standalone -d $domain
    
    # Copy certificates to expected locations
    sudo cp /etc/letsencrypt/live/$domain/privkey.pem /etc/ssl/private/server.key
    sudo cp /etc/letsencrypt/live/$domain/fullchain.pem /etc/ssl/certs/server.crt
    
    echo "✅ Let's Encrypt certificate installed!"
    ;;
    
  3)
    echo "📁 Please upload your SSL certificate files:"
    echo "- Private key: /etc/ssl/private/server.key"
    echo "- Certificate: /etc/ssl/certs/server.crt"
    echo ""
    echo "Example commands to upload:"
    echo "scp your-private-key.pem root@67.205.179.77:/etc/ssl/private/server.key"
    echo "scp your-certificate.crt root@67.205.179.77:/etc/ssl/certs/server.crt"
    ;;
esac

# Set correct permissions
sudo chmod 600 /etc/ssl/private/server.key
sudo chmod 644 /etc/ssl/certs/server.crt

echo ""
echo "🔧 Setting up environment variables..."
echo "SSL_ENABLED=true" >> /var/www/nightflow-server/.env
echo "HTTPS_PORT=3443" >> /var/www/nightflow-server/.env
echo "SSL_CERT_PATH=/etc/ssl/certs/server.crt" >> /var/www/nightflow-server/.env
echo "SSL_KEY_PATH=/etc/ssl/private/server.key" >> /var/www/nightflow-server/.env

echo ""
echo "🚀 Restarting your streaming server with HTTPS support..."
cd /var/www/nightflow-server
pm2 restart all

echo ""
echo "✅ SSL setup complete!"
echo "🔗 Your HTTPS API should be available at: https://67.205.179.77:3443"
echo "🔗 Your HTTP API remains at: http://67.205.179.77:3001"
echo "🎯 OBS still uses: rtmp://67.205.179.77:1935/live"
echo ""
echo "🧪 Test your HTTPS endpoint:"
echo "curl -k https://67.205.179.77:3443/health"
