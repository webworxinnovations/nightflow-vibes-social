#!/bin/bash

echo "🔒 Starting NightFlow HTTPS-Only Streaming Server"
echo "📍 Droplet IP: 67.205.179.77"

# Stop any existing servers
echo "🛑 Stopping existing servers..."
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

echo "🔧 Checking SSL certificates..."
if [ ! -f "/etc/ssl/certs/server.crt" ] || [ ! -f "/etc/ssl/private/server.key" ]; then
    echo "❌ SSL certificates not found!"
    echo "🔧 Setting up SSL certificates..."
    sudo ./setup-ssl-quick.sh
fi

echo "🚀 Starting HTTPS-only streaming server..."
cd /var/www/nightflow-server

# Start the HTTPS streaming server
pm2 start https-streaming-server.js --name "nightflow-https" --env production --log-date-format="YYYY-MM-DD HH:mm:ss" --max-memory-restart 1G

echo "⏱️ Giving server time to initialize..."
sleep 5

# Check if it's running
if pm2 list | grep -q "nightflow-https.*online"; then
    echo ""
    echo "✅ NightFlow HTTPS Streaming Server is running!"
    echo ""
    echo "🔒 HTTPS Endpoints:"
    echo "   API: https://67.205.179.77:3443"
    echo "   Health: https://67.205.179.77:3443/health"
    echo "   HLS Streams: https://67.205.179.77:3443/live/[streamKey]/index.m3u8"
    echo ""
    echo "🎥 OBS Configuration:"
    echo "   Server: rtmp://67.205.179.77:1935/live"
    echo "   Stream Key: Generate from NightFlow app"
    echo ""
    echo "✅ No more HTTP! Everything runs on HTTPS!"
    echo "✅ Compatible with Lovable and all HTTPS environments!"
    echo ""
    echo "🔍 To monitor logs: pm2 logs nightflow-https"
    echo "📊 To check status: pm2 status"
else
    echo "❌ Server failed to start. Check logs:"
    pm2 logs nightflow-https --lines 50
fi