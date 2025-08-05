#!/bin/bash

echo "🔧 Configuring DigitalOcean Droplet ports for NightFlow streaming..."
echo "📍 Droplet IP: 67.205.179.77"

# Enable UFW if not already enabled
sudo ufw --force enable

# Configure firewall rules for streaming
echo "🔥 Configuring firewall rules..."

# SSH (already should be enabled)
sudo ufw allow 22

# HTTP API Server (Express)
sudo ufw allow 3001/tcp
echo "✅ Port 3001 allowed (HTTP API)"

# HTTPS API Server (Express with SSL)
sudo ufw allow 3443/tcp
echo "✅ Port 3443 allowed (HTTPS API)"

# RTMP Server (for OBS streaming)
sudo ufw allow 1935/tcp
echo "✅ Port 1935 allowed (RTMP)"

# HLS Server (Node Media Server HTTP)
sudo ufw allow 9001/tcp
echo "✅ Port 9001 allowed (HLS)"

# Show firewall status
echo ""
echo "🔥 Current firewall status:"
sudo ufw status numbered

echo ""
echo "🧪 Testing port connectivity..."
echo "Testing if ports are listening:"
netstat -tlnp | grep :3001 && echo "✅ Port 3001 is listening" || echo "❌ Port 3001 not listening"
netstat -tlnp | grep :3443 && echo "✅ Port 3443 is listening" || echo "❌ Port 3443 not listening"  
netstat -tlnp | grep :1935 && echo "✅ Port 1935 is listening" || echo "❌ Port 1935 not listening"
netstat -tlnp | grep :9001 && echo "✅ Port 9001 is listening" || echo "❌ Port 9001 not listening"

echo ""
echo "🌐 Testing external connectivity..."
echo "You can test these URLs from your browser:"
echo "🔗 HTTP API: http://67.205.179.77:3001/health"
echo "🔗 HTTPS API: https://67.205.179.77:3443/health"
echo "🎯 RTMP (for OBS): rtmp://67.205.179.77:1935/live/YOUR_STREAM_KEY"
echo "📺 HLS Test: http://67.205.179.77:9001/live/YOUR_STREAM_KEY/index.m3u8"

echo ""
echo "✅ Droplet port configuration complete!"
echo "💡 If ports still aren't accessible, check DigitalOcean Cloud Firewall settings"