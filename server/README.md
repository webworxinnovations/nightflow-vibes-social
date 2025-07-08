# Nightflow Streaming Server

This is the backend streaming server for Nightflow that handles real RTMP ingestion and HLS output.

## Setup Instructions

1. **Install Node.js** (v16 or higher)

2. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install FFmpeg** (required for media processing):
   - **macOS:** `brew install ffmpeg`
   - **Ubuntu:** `sudo apt update && sudo apt install ffmpeg`
   - **Windows:** Download from https://ffmpeg.org/download.html

4. **Start the server:**
   ```bash
   npm start
   ```

   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

## Server Endpoints

- **RTMP Ingest:** `rtmp://localhost:1935/live/{stream_key}`
- **HLS Output:** `http://localhost:9001/live/{stream_key}/index.m3u8`
- **API Status:** `http://localhost:9001/api/stream/{stream_key}/status`
- **WebSocket:** `ws://localhost:9001/stream/{stream_key}/status`

## OBS Configuration

1. In OBS Studio, go to **Settings → Stream**
2. Set **Service** to "Custom..."
3. Set **Server** to: `rtmp://localhost:1935/live`
4. Set **Stream Key** to your generated Nightflow stream key
5. Click **Apply** then **OK**
6. Click **Start Streaming**

## Production Deployment

For production deployment to DigitalOcean:

1. **DigitalOcean Droplet (Recommended):**
   - Use the automated deployment script: `./scripts/deploy-to-droplet.sh`
   - Manual setup guide: See `deploy-to-droplet.md`
   - Full control over server configuration
   - Cost: $12-36/month depending on performance needs

2. **DigitalOcean App Platform:**
   - Managed deployment with integrated monitoring
   - Less configuration required
   - Cost: ~$12/month for basic plan

See `DEPLOYMENT.md` for complete deployment instructions.

## Environment Variables

Create a `.env` file for production configuration:

```env
NODE_ENV=production
PORT=9001
RTMP_PORT=1935
HLS_PORT=9001
SSL_ENABLED=false
MEDIA_ROOT=/tmp/media
```

## Features

- ✅ Real RTMP ingestion from OBS
- ✅ Automatic HLS transcoding
- ✅ Real-time stream status via WebSocket
- ✅ Stream validation and authentication
- ✅ Viewer count tracking
- ✅ Stream analytics (duration, bitrate, etc.)
- ✅ Multi-quality streaming support
- ✅ CORS enabled for web player integration
- ✅ DigitalOcean optimized configuration

## Scaling

For high-traffic scenarios:
- Use multiple DigitalOcean droplets with load balancing
- Implement CDN distribution for HLS streams (Cloudflare)
- Add Redis for session management
- Set up stream recording and VOD playback
- Implement proper authentication and authorization

## Development

**Local Testing:**
```bash
npm run dev
```

**Testing OBS Connection:**
1. Start local server
2. Configure OBS with `rtmp://localhost:1935/live`
3. Use any stream key (e.g., `test123`)
4. Check HLS output at `http://localhost:9001/live/test123/index.m3u8`

**Debugging:**
- Server logs show RTMP connections and HLS generation
- Health check: `http://localhost:9001/health`
- Stream status: `http://localhost:9001/api/stream/YOUR_KEY/status`