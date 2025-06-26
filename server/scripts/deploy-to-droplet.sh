
#!/bin/bash

# Deployment script for DigitalOcean Droplet
# Usage: ./deploy-to-droplet.sh

set -e

DROPLET_IP="67.205.179.77"
DEPLOY_PATH="/var/www/nightflow-server"
SERVER_PATH="./server"

echo "🚀 Starting deployment to DigitalOcean Droplet..."

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
echo "🔧 Deploying on droplet..."
ssh root@$DROPLET_IP << 'EOF'
    # Create directory if it doesn't exist
    mkdir -p /var/www/nightflow-server
    cd /var/www/nightflow-server
    
    # Extract new files
    tar -xzf /tmp/nightflow-server.tar.gz
    
    # Install dependencies
    npm install --production
    
    # Create media directory
    mkdir -p media
    
    # Set permissions
    chown -R www-data:www-data /var/www/nightflow-server
    
    # Restart service
    pm2 restart nightflow-rtmp || pm2 start streaming-server.js --name "nightflow-rtmp"
    
    # Clean up
    rm /tmp/nightflow-server.tar.gz
    
    echo "✅ Deployment completed successfully!"
EOF

# Clean up local files
rm nightflow-server.tar.gz

echo "🎉 Deployment to DigitalOcean Droplet completed!"
echo "🔗 Your RTMP server should be available at: rtmp://$DROPLET_IP:1935/live"
echo "🔗 API should be available at: http://$DROPLET_IP:3001"
echo ""
echo "Next steps:"
echo "1. Test the health endpoint: curl http://$DROPLET_IP:3001/health"
echo "2. Configure your frontend to use the droplet endpoints"
echo "3. Test OBS connection with: rtmp://$DROPLET_IP:1935/live"
