
#!/bin/bash

echo "🔄 Restarting DigitalOcean droplet streaming server with fixed configuration..."

# Stop current processes
pm2 stop all
pm2 delete all

# Wait a moment
sleep 2

# Start with the fixed configuration
cd /var/www/nightflow-server
pm2 start streaming-server.js --name "nightflow-streaming" --env production

# Save the PM2 configuration
pm2 save

echo "✅ Droplet streaming server restarted with port 3001 for HLS"
echo "🎯 RTMP: rtmp://67.205.179.77:1935/live"
echo "🎯 HLS: http://67.205.179.77:3001/live/[streamKey]/index.m3u8"
echo "🎯 Both services now using correct ports for frontend compatibility"

# Check the status
pm2 status
netstat -tlnp | grep :3001
netstat -tlnp | grep :1935
