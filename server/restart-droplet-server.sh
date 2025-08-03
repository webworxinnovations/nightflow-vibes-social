
#!/bin/bash

echo "🔄 Restarting DigitalOcean droplet streaming server with HTTPS enabled..."

# Stop current processes
pm2 stop all
pm2 delete all

# Wait a moment
sleep 2

# Start with HTTPS configuration
cd /var/www/nightflow-server
SSL_ENABLED=true pm2 start streaming-server.js --name "nightflow-streaming" --env production

# Save the PM2 configuration
pm2 save

echo "✅ Droplet streaming server restarted with HTTPS enabled"
echo "🎯 RTMP: rtmp://67.205.179.77:1935/live"
echo "🎯 HTTPS API: https://67.205.179.77:3443"
echo "🎯 HLS: https://67.205.179.77:3443/live/[streamKey]/index.m3u8"

# Check the status
pm2 status
netstat -tlnp | grep :3443
netstat -tlnp | grep :1935
