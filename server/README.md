
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
- **HLS Output:** `http://localhost:8080/live/{stream_key}/index.m3u8`
- **API Status:** `http://localhost:3001/api/stream/{stream_key}/status`
- **WebSocket:** `ws://localhost:3001/stream/{stream_key}/status`

## OBS Configuration

1. In OBS Studio, go to **Settings → Stream**
2. Set **Service** to "Custom..."
3. Set **Server** to: `rtmp://localhost:1935/live`
4. Set **Stream Key** to your generated Nightflow stream key
5. Click **Apply** then **OK**
6. Click **Start Streaming**

## Production Deployment

For production, you'll need to:

1. Deploy this server to a cloud provider (AWS, DigitalOcean, etc.)
2. Update the URLs in `src/services/streamingService.ts`
3. Set up proper domain names and SSL certificates
4. Configure firewall rules for ports 1935 (RTMP) and 3001 (API)
5. Set up load balancing for multiple streaming servers if needed

## Environment Variables

Create a `.env` file for production configuration:

```env
NODE_ENV=production
RTMP_PORT=1935
HTTP_PORT=8080
API_PORT=3001
DOMAIN=stream.nightflow.app
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

## Scaling

For high-traffic scenarios:
- Use multiple streaming servers with load balancing
- Implement CDN distribution for HLS streams
- Add Redis for session management
- Set up stream recording and VOD playback
- Implement proper authentication and authorization
