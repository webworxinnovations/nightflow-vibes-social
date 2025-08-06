#!/bin/bash

echo "🔥 Starting NightFlow Streaming Server with HTTPS..."

# Install dependencies
npm install

# Create required directories
sudo mkdir -p /tmp/media
sudo chmod 755 /tmp/media

# Start server with SSL enabled
SSL_ENABLED=true pm2 start streaming-server-fixed.js --name "nightflow-streaming" --env production

# Save PM2 configuration
pm2 save

echo "✅ NightFlow Streaming Server started!"
echo "🎯 RTMP: rtmp://67.205.179.77:1935/live"
echo "🎯 HTTP: http://67.205.179.77:8888/health"
echo "🎯 HTTPS: https://67.205.179.77:3443/health" 
echo "🎯 HLS: https://67.205.179.77:3443/live/[streamKey]/index.m3u8"

# Check status
pm2 status