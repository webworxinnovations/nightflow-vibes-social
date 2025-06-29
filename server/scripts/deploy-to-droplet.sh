
#!/bin/bash

# Deployment script for DigitalOcean Droplet - RAILWAY FREE VERSION
# Usage: ./deploy-to-droplet.sh

set -e

DROPLET_IP="67.205.179.77"
DEPLOY_PATH="/var/www/nightflow-server"
SERVER_PATH="./server"

echo "🚀 Starting deployment to DigitalOcean Droplet ($DROPLET_IP)..."
echo "🌊 Removing ALL Railway references and using DROPLET ONLY configuration"

# Check if server directory exists
if [ ! -d "$SERVER_PATH" ]; then
    echo "❌ Server directory not found. Make sure you're running this from the project root."
    exit 1
fi

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf nightflow-server.tar.gz -C server .

# Upload to droplet
echo "📤 Uploading to droplet..."
scp nightflow-server.tar.gz root@$DROPLET_IP:/tmp/

# Deploy on droplet
echo "🔧 Deploying on droplet with DROPLET-ONLY configuration..."
ssh root@$DROPLET_IP << 'EOF'
    # Stop any existing services
    pm2 stop all || echo "No PM2 processes to stop"
    pm2 delete all || echo "No PM2 processes to delete"
    
    # Create directory if it doesn't exist
    mkdir -p /var/www/nightflow-server
    cd /var/www/nightflow-server
    
    # Backup old version
    if [ -d "backup" ]; then
        rm -rf backup
    fi
    mkdir -p backup
    cp -r * backup/ 2>/dev/null || echo "No existing files to backup"
    
    # Extract new files
    tar -xzf /tmp/nightflow-server.tar.gz
    
    # Install dependencies
    npm install --production
    
    # Create media directory
    mkdir -p /tmp/media
    mkdir -p /tmp/media/live
    
    # Set permissions
    chown -R www-data:www-data /var/www/nightflow-server 2>/dev/null || echo "www-data user not found, skipping permissions"
    
    # Remove any Railway environment variables
    unset RAILWAY_ENVIRONMENT
    unset RAILWAY_SERVICE_ID
    unset RAILWAY_PROJECT_ID
    
    # Set DigitalOcean environment variables
    export NODE_ENV=production
    export PORT=3001
    export MEDIA_ROOT=/tmp/media
    
    # Start service with DROPLET-ONLY configuration
    pm2 start streaming-server.js --name "nightflow-droplet" --env production
    
    # Save the PM2 configuration
    pm2 save
    pm2 startup || echo "PM2 startup already configured"
    
    # Clean up
    rm /tmp/nightflow-server.tar.gz
    
    echo "✅ DigitalOcean Droplet deployment completed successfully!"
    echo "🌊 ALL Railway references removed - DROPLET ONLY configuration active"
    
    # Show process status
    pm2 list
    
    # Test the endpoints
    sleep 5
    echo "🧪 Testing droplet endpoints..."
    curl -s http://localhost:3001/health | head -20 || echo "Health check failed"
    
EOF

# Clean up local files
rm nightflow-server.tar.gz

echo "🎉 Deployment to DigitalOcean Droplet completed!"
echo "🌊 ALL Railway references have been removed from server code"
echo "🔗 Your RTMP server should be available at: rtmp://$DROPLET_IP:1935/live"
echo "🔗 API should be available at: http://$DROPLET_IP:3001"
echo "🔗 Health check: http://$DROPLET_IP:3001/health"
echo ""
echo "Next steps:"
echo "1. Test the health endpoint: curl http://$DROPLET_IP:3001/health"
echo "2. Verify NO Railway references in the health response"
echo "3. Generate a stream key in your Night Flow app"
echo "4. Test OBS connection with: rtmp://$DROPLET_IP:1935/live"
echo "5. Configure OBS with your generated stream key"
