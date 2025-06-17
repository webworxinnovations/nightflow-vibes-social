
# Nightflow Streaming Server Deployment Guide

This guide will help you deploy your Node.js streaming server to make OBS integration work with your live Nightflow app.

## Quick Deployment Options

### Option 1: Railway (Recommended - Easiest)

Railway is perfect for Node.js apps and handles everything automatically.

**Steps:**
1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub account and select your Nightflow repository
4. Railway will detect the `server/` folder automatically
5. Set these environment variables in Railway:
   ```
   NODE_ENV=production
   PORT=3001
   RTMP_PORT=1935
   HTTP_PORT=8080
   ```
6. Deploy! Railway will give you URLs like:
   - API: `https://your-app.railway.app`
   - WebSocket: `wss://your-app.railway.app`

**Cost:** Free tier available, then ~$5/month

### Option 2: DigitalOcean App Platform

Good balance of control and simplicity.

**Steps:**
1. Go to [digitalocean.com](https://digitalocean.com) and create account
2. Go to App Platform → Create App
3. Connect your GitHub repo
4. Set source directory to `/server`
5. Add environment variables:
   ```
   NODE_ENV=production
   RTMP_PORT=1935
   HTTP_PORT=8080
   API_PORT=3001
   ```
6. Deploy

**Cost:** ~$12/month for basic plan

### Option 3: Heroku (Simple but more expensive)

**Steps:**
1. Install Heroku CLI
2. In your `server/` directory:
   ```bash
   heroku create your-streaming-app
   git subtree push --prefix server heroku main
   heroku config:set NODE_ENV=production
   ```

**Cost:** ~$25/month minimum

## Environment Variables You Need

After deployment, update your Nightflow frontend with these URLs:

```env
# Replace with your actual deployed URLs
VITE_STREAMING_SERVER_URL=wss://your-streaming-server.railway.app
VITE_RTMP_URL=rtmp://your-streaming-server.railway.app/live
VITE_HLS_BASE_URL=https://your-streaming-server.railway.app
```

## Testing Your Deployment

1. **Test API endpoint:**
   ```bash
   curl https://your-streaming-server.railway.app/api/stream/test123/status
   ```

2. **Test WebSocket:**
   Open browser console on your deployed Nightflow app and check for WebSocket connection logs

3. **Test OBS streaming:**
   - Generate stream key in your app
   - Set OBS server to: `rtmp://your-streaming-server.railway.app/live`
   - Use your generated stream key
   - Start streaming from OBS
   - Check if you go live in your app

## Firewall and Ports

Make sure these ports are open on your server:
- **1935** - RTMP ingestion (OBS connects here)
- **8080** - HLS video delivery (viewers watch here)  
- **3001** - API and WebSocket (your app connects here)

Most cloud providers (Railway, DigitalOcean, Heroku) handle this automatically.

## SSL/HTTPS Requirements

For production, you MUST have HTTPS/WSS because:
- Modern browsers require HTTPS for camera access
- WebSocket connections need WSS in production
- OBS works fine with regular RTMP (no SSL needed)

All recommended platforms provide HTTPS automatically.

## Performance Considerations

**For 10-100 concurrent viewers:**
- Railway free tier is fine
- 1GB RAM, 1 CPU core sufficient

**For 100-1000 concurrent viewers:**
- Upgrade to paid plan
- 2GB RAM, 2 CPU cores minimum
- Consider CDN for video delivery

**For 1000+ concurrent viewers:**
- Multiple server instances
- Load balancer
- CDN (Cloudflare, AWS CloudFront)
- Professional streaming service (100ms, Agora)

## Monitoring and Logs

**Railway:** Built-in logs and metrics dashboard
**DigitalOcean:** Integrated monitoring available
**Heroku:** Heroku logs command

## Troubleshooting Common Issues

**OBS can't connect:**
- Check RTMP URL format: `rtmp://your-server.com/live`
- Verify port 1935 is open
- Try with/without `/live` suffix

**WebSocket connection fails:**
- Ensure using WSS (not WS) in production
- Check firewall allows port 3001
- Verify environment variables are set

**Videos won't play:**
- Check HLS URL is accessible in browser
- Verify FFmpeg is installed on server
- Check server logs for transcoding errors

**High latency:**
- Reduce OBS keyframe interval to 1-2 seconds
- Use CBR (constant bitrate) in OBS
- Choose server region close to you

## Next Steps After Deployment

1. **Update frontend URLs** in your Nightflow app
2. **Test everything** with real OBS streaming
3. **Add monitoring** to track server health
4. **Set up backups** for important data
5. **Plan scaling** for when you get popular!

## Need Help?

- Railway Discord: Great community for deployment help
- DigitalOcean tutorials: Comprehensive guides
- Nightflow Discord: App-specific help (if available)

Remember: Start simple, test thoroughly, scale when needed! 🚀

