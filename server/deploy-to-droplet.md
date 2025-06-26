
# Deploy to DigitalOcean Droplet Guide

## Droplet Information
- **IP Address**: 67.205.179.77
- **Domain**: nightflow-app-wijb2.ondigitalocean.app
- **RTMP Port**: 1935
- **HLS Port**: 8080

## Step 1: Connect to Your Droplet

```bash
# SSH into your droplet (replace with your SSH key path if needed)
ssh root@67.205.179.77
```

## Step 2: Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install FFmpeg for media processing
apt install -y ffmpeg

# Verify installations
node --version
npm --version
ffmpeg -version
```

## Step 3: Upload Server Code

```bash
# Create app directory
mkdir -p /var/www/nightflow-server
cd /var/www/nightflow-server

# Clone or upload your server files here
# You can use scp, git, or file transfer
```

## Step 4: Install Server Dependencies

```bash
cd /var/www/nightflow-server
npm install
```

## Step 5: Configure Environment

```bash
# Create environment file
cat > .env << EOF
NODE_ENV=production
PORT=3001
DIGITALOCEAN_APP_URL=https://nightflow-app-wijb2.ondigitalocean.app
RTMP_PORT=1935
HLS_PORT=8080
EOF
```

## Step 6: Configure Firewall

```bash
# Allow SSH (if not already configured)
ufw allow ssh

# Allow HTTP and HTTPS
ufw allow 80
ufw allow 443

# Allow RTMP port for OBS
ufw allow 1935

# Allow HLS streaming port
ufw allow 8080

# Allow API port
ufw allow 3001

# Enable firewall
ufw --force enable

# Check status
ufw status
```

## Step 7: Start the Server

```bash
# Start with PM2
pm2 start streaming-server.js --name "nightflow-rtmp"

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

## Step 8: Test the Setup

```bash
# Check if server is running
pm2 status

# Check logs
pm2 logs nightflow-rtmp

# Test health endpoint
curl http://localhost:3001/health
```

## Step 9: Configure Nginx (Optional but Recommended)

```bash
# Install Nginx
apt install -y nginx

# Create Nginx configuration
cat > /etc/nginx/sites-available/nightflow << EOF
server {
    listen 80;
    server_name 67.205.179.77 nightflow-app-wijb2.ondigitalocean.app;

    # API proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # WebSocket proxy
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # HLS streaming
    location /live {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS headers for streaming
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
        add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the site
ln -s /etc/nginx/sites-available/nightflow /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## Step 10: Final Testing

```bash
# Test from your local machine
curl http://67.205.179.77/health
curl http://nightflow-app-wijb2.ondigitalocean.app/health

# Test RTMP connectivity (from your local machine with ffmpeg)
ffmpeg -re -i test.mp4 -c copy -f flv rtmp://67.205.179.77:1935/live/test_stream_key
```

## Troubleshooting

### Check Logs
```bash
pm2 logs nightflow-rtmp
tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
pm2 restart nightflow-rtmp
systemctl restart nginx
```

### Check Ports
```bash
netstat -tlnp | grep :1935
netstat -tlnp | grep :8080
netstat -tlnp | grep :3001
```

## OBS Configuration
- **Service**: Custom...
- **Server**: rtmp://67.205.179.77:1935/live
- **Stream Key**: Your generated stream key from the app

## Security Notes
- Consider setting up SSL certificates with Let's Encrypt
- Implement proper authentication for the API endpoints
- Monitor server resources and logs regularly
- Set up automated backups
