
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

class HTTPStreamServer {
  constructor(serverConfig, streamManager) {
    this.serverConfig = serverConfig;
    this.streamManager = streamManager;
    this.router = express.Router();
    
    console.log('🌐 Initializing HTTP Stream Server for DigitalOcean...');
    this.setupRoutes();
  }

  setupRoutes() {
    // HTTP Live Streaming ingestion endpoint (alternative to RTMP)
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 } // 50MB chunks
    });

    // WebRTC-based streaming endpoint
    this.router.post('/stream/webrtc/:streamKey', upload.single('chunk'), (req, res) => {
      const { streamKey } = req.params;
      
      if (!this.validateStreamKey(streamKey)) {
        return res.status(400).json({ error: 'Invalid stream key' });
      }

      console.log(`🌐 HTTP stream chunk received for ${streamKey}`);
      
      // Process the streaming chunk
      this.processStreamChunk(streamKey, req.file);
      
      res.json({ 
        success: true, 
        message: 'Chunk processed',
        streamKey: streamKey,
        timestamp: new Date().toISOString()
      });
    });

    // Browser-based streaming endpoint (using MediaRecorder API)
    this.router.post('/stream/browser/:streamKey', upload.single('segment'), (req, res) => {
      const { streamKey } = req.params;
      
      if (!this.validateStreamKey(streamKey)) {
        return res.status(400).json({ error: 'Invalid stream key' });
      }

      console.log(`🌐 Browser stream segment received for ${streamKey}`);
      
      // Update stream status
      this.streamManager.updateStream(streamKey, {
        isLive: true,
        lastUpdate: Date.now(),
        method: 'browser'
      });
      
      res.json({ 
        success: true, 
        method: 'browser',
        streamKey: streamKey 
      });
    });

    // Stream status endpoint
    this.router.get('/stream/status/:streamKey', (req, res) => {
      const { streamKey } = req.params;
      const stream = this.streamManager.getStream(streamKey);
      
      res.json({
        isLive: stream ? stream.isLive : false,
        viewerCount: stream ? stream.viewerCount : 0,
        method: stream ? stream.method : 'none',
        lastUpdate: stream ? stream.lastUpdate : null
      });
    });

    // DigitalOcean streaming instructions endpoint
    this.router.get('/stream/instructions/:streamKey', (req, res) => {
      const { streamKey } = req.params;
      const baseUrl = `http://67.205.179.77:9001`;

      res.json({
        streamKey: streamKey,
        methods: {
          browser: {
            url: `${baseUrl}/api/stream/browser/${streamKey}`,
            description: 'Stream directly from your browser using WebRTC',
            supported: true
          },
          webrtc: {
            url: `${baseUrl}/api/stream/webrtc/${streamKey}`,
            description: 'Use WebRTC-compatible software',
            supported: true
          },
          rtmp: {
            url: `rtmp://67.205.179.77:1935/live/${streamKey}`,
            description: 'Full RTMP support available on DigitalOcean',
            supported: true
          }
        },
        digitalocean_info: {
          platform: 'DigitalOcean Droplet',
          rtmp_available: true,
          ip: '67.205.179.77',
          ports: { rtmp: 1935, http: 9001 }
        }
      });
    });
  }

  validateStreamKey(streamKey) {
    return streamKey && streamKey.startsWith('nf_') && streamKey.length > 10;
  }

  processStreamChunk(streamKey, chunk) {
    if (!chunk) return;
    
    // Create stream directory
    const streamDir = path.join(this.serverConfig.mediaRoot, 'live', streamKey);
    if (!fs.existsSync(streamDir)) {
      fs.mkdirSync(streamDir, { recursive: true });
    }
    
    // Save chunk (simplified - in production you'd process this into HLS segments)
    const chunkPath = path.join(streamDir, `chunk_${Date.now()}.webm`);
    fs.writeFileSync(chunkPath, chunk.buffer);
    
    console.log(`💾 Saved stream chunk: ${chunkPath}`);
  }

  getRouter() {
    return this.router;
  }
}

module.exports = HTTPStreamServer;
