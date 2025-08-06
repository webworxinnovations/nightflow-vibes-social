#!/bin/bash

echo "🔧 Fixing NightFlow streaming server..."
echo "📍 Stopping all streaming processes..."

# Stop all current processes
pm2 stop nightflow-streaming 2>/dev/null || true
pm2 delete nightflow-streaming 2>/dev/null || true
pm2 stop debug-streaming 2>/dev/null || true
pm2 delete debug-streaming 2>/dev/null || true

# Kill any processes on our ports
sudo fuser -k 1935/tcp 2>/dev/null || true
sudo fuser -k 3443/tcp 2>/dev/null || true
sudo fuser -k 9001/tcp 2>/dev/null || true

echo "⏱️ Waiting for ports to clear..."
sleep 3

echo "🚀 Starting fixed streaming server..."
cd /var/www/nightflow-server

# Start the main server with error handling fixes
pm2 start streaming-server.js --name "nightflow-streaming" --env production --log-date-format="YYYY-MM-DD HH:mm:ss" --max-memory-restart 1G

echo "⏱️ Giving server time to initialize..."
sleep 5

# Check if it's running
if pm2 list | grep -q "nightflow-streaming.*online"; then
    echo "✅ NightFlow streaming server is running with fixes!"
    echo "🎯 RTMP URL: rtmp://67.205.179.77:1935/live/YOUR_STREAM_KEY"
    echo "📺 HLS URL: http://67.205.179.77:9001/live/YOUR_STREAM_KEY/index.m3u8"
    echo ""
    echo "🔍 To monitor logs: pm2 logs nightflow-streaming"
    echo "📊 To check status: pm2 status"
else
    echo "❌ Server failed to start. Check logs:"
    pm2 logs nightflow-streaming --lines 50
fi