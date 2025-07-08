# Nightflow Streaming Server Deployment Guide

This guide will help you deploy your Node.js streaming server to make OBS integration work with your live Nightflow app.

## DigitalOcean Droplet Deployment (Recommended)

DigitalOcean droplets provide full control and excellent performance for streaming applications.

**Steps:**
1. Create a DigitalOcean account at [digitalocean.com](https://digitalocean.com)
2. Create a new Droplet (Ubuntu 22.04 LTS recommended)
3. Choose appropriate size:
   - **Basic ($12/month):** 2GB RAM, 1 CPU - Good for 10-50 viewers
   - **General Purpose ($18/month):** 2GB RAM, 2 CPU - Good for 50-200 viewers
4. Add your SSH key for secure access
5. Use the provided deployment script:
   ```bash
   ./scripts/deploy-to-droplet.sh
   ```

**Manual Setup:**
If you prefer manual setup, see `deploy-to-droplet.md` for detailed instructions.

## Only Deployment Method: DigitalOcean Droplet

DigitalOcean droplets provide full control and excellent performance for streaming applications.

## Environment Variables You Need

After deployment, update your Nightflow frontend with these URLs:

```env
# Replace with your actual deployed URLs
VITE_STREAMING_SERVER_URL=wss://your-droplet-ip:9001
VITE_RTMP_URL=rtmp://your-droplet-ip:1935/live
VITE_HLS_BASE_URL=http://your-droplet-ip:9001/live
```

## Testing Your Deployment

1. **Test API endpoint:**
   ```bash
   curl http://your-droplet-ip:9001/health
   ```

2. **Test WebSocket:**
   Open browser console on your deployed Nightflow app and check for WebSocket connection logs

3. **Test OBS streaming:**
   - Generate stream key in your app
   - Set OBS server to: `rtmp://your-droplet-ip:1935/live`
   - Use your generated stream key
   - Start streaming from OBS
   - Check if you go live in your app

## Firewall and Ports

Make sure these ports are open on your server:
- **1935** - RTMP ingestion (OBS connects here)
- **9001** - API, WebSocket, and HLS delivery
- **22** - SSH access (for management)

DigitalOcean droplets come with ufw firewall that needs configuration.

## SSL/HTTPS Setup (Optional)

For production with custom domains, you can add HTTPS:
- Use Let's Encrypt for free SSL certificates
- Configure nginx as reverse proxy
- Ensure WebSocket connections use WSS
- OBS works fine with regular RTMP (no SSL needed)

See `setup-ssl.sh` for automated SSL setup.

## Performance Considerations

**For 10-100 concurrent viewers:**
- Basic DigitalOcean droplet ($12/month) is sufficient
- 2GB RAM, 1 CPU core

**For 100-1000 concurrent viewers:**
- General Purpose droplet ($18-36/month)
- 4GB RAM, 2 CPU cores minimum
- Consider CDN for video delivery

**For 1000+ concurrent viewers:**
- Multiple server instances with load balancer
- CDN (Cloudflare, AWS CloudFront)
- Professional streaming service integration

## Monitoring and Logs

**DigitalOcean Droplet:**
- SSH access for direct log monitoring
- Built-in monitoring dashboard
- Can install custom monitoring (Grafana, etc.)

**DigitalOcean Droplet:**
- Full control over server configuration
- Direct SSH access for debugging and monitoring

## Troubleshooting Common Issues

**OBS can't connect:**
- Check RTMP URL format: `rtmp://your-droplet-ip:1935/live`
- Verify port 1935 is open in firewall
- Check server logs: `pm2 logs`

**WebSocket connection fails:**
- Ensure port 9001 is accessible
- Check firewall settings
- Verify environment variables are set

**Videos won't play:**
- Check HLS URL is accessible: `http://your-droplet-ip:9001/live/STREAM_KEY/index.m3u8`
- Verify FFmpeg is installed on server
- Check server logs for transcoding errors

**High latency:**
- Reduce OBS keyframe interval to 1-2 seconds
- Use CBR (constant bitrate) in OBS
- Choose droplet region close to your location

## Next Steps After Deployment

1. **Update frontend URLs** in your Nightflow app
2. **Test everything** with real OBS streaming
3. **Set up monitoring** to track server health
4. **Configure backups** for important data
5. **Plan scaling** for growth

## Need Help?

- DigitalOcean tutorials: Comprehensive deployment guides
- DigitalOcean Community: Active support forums
- Nightflow documentation: App-specific configuration help

Remember: Start simple, test thoroughly, scale when needed! 🚀