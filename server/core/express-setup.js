const { setupMiddleware, createApiRoutes, setupErrorHandling } = require('../routes/api-routes');

class ExpressSetup {
  static setupApp(app, serverConfig, streamManager, httpStreamServer) {
    console.log('🔧 Setting up Express application...');
    
    try {
      setupMiddleware(app, serverConfig);
      console.log('✅ Middleware setup complete');
    } catch (error) {
      console.error('❌ Failed to setup middleware:', error);
      throw error;
    }

    // Add essential health check endpoint FIRST
    app.get('/health', (req, res) => {
      console.log('📋 Health check requested');
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        server: 'nightflow-streaming-server',
        version: '2.2.0',
        uptime: Math.floor(process.uptime()),
        digitalocean: {
          droplet_ip: '67.205.179.77',
          environment: process.env.NODE_ENV || 'production'
        },
        streaming: {
          rtmp: {
            configured: true,
            port: serverConfig.RTMP_PORT,
            status: 'ready',
            url: `rtmp://67.205.179.77:${serverConfig.RTMP_PORT}/live`
          },
          http: {
            configured: true,
            available: true,
            status: 'ready',
            port: serverConfig.DROPLET_PORT,
            url: `http://67.205.179.77:${serverConfig.DROPLET_PORT}/live`
          },
          api: {
            ready: true,
            status: 'operational',
            port: serverConfig.DROPLET_PORT
          }
        }
      });
    });

    // Add API health endpoint
    app.get('/api/health', (req, res) => {
      console.log('📋 API health check requested');
      res.json({
        status: 'ok',
        rtmp_ready: true,
        api_ready: true,
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        droplet_ip: '67.205.179.77'
      });
    });

    // Add HLS proxy route for HTTPS access to Node Media Server content
    app.get('/live/:streamKey/index.m3u8', async (req, res) => {
      const { streamKey } = req.params;
      const hlsUrl = `http://127.0.0.1:9001/live/${streamKey}/index.m3u8`;
      
      console.log(`🎥 Proxying HLS request for stream: ${streamKey}`);
      console.log(`📡 Forwarding to: ${hlsUrl}`);
      
      try {
        const { default: fetch } = await import('node-fetch');
        const response = await fetch(hlsUrl);
        
        if (response.ok) {
          const content = await response.text();
          res.set('Content-Type', 'application/vnd.apple.mpegurl');
          res.set('Access-Control-Allow-Origin', '*');
          res.set('Access-Control-Allow-Headers', '*');
          res.send(content);
          console.log(`✅ HLS proxy successful for stream: ${streamKey}`);
        } else {
          console.log(`❌ HLS stream not available: ${streamKey}`);
          res.status(404).json({ error: 'Stream not available' });
        }
      } catch (error) {
        console.error(`❌ HLS proxy error for ${streamKey}:`, error);
        res.status(500).json({ error: 'Proxy error' });
      }
    });

    // Add HLS segment proxy route  
    app.get('/live/:streamKey/:segment', async (req, res) => {
      const { streamKey, segment } = req.params;
      const segmentUrl = `http://127.0.0.1:9001/live/${streamKey}/${segment}`;
      
      try {
        const { default: fetch } = await import('node-fetch');
        const response = await fetch(segmentUrl);
        
        if (response.ok) {
          const buffer = await response.buffer();
          res.set('Content-Type', 'video/mp2t');
          res.set('Access-Control-Allow-Origin', '*');
          res.send(buffer);
        } else {
          res.status(404).json({ error: 'Segment not available' });
        }
      } catch (error) {
        console.error(`❌ Segment proxy error:`, error);
        res.status(500).json({ error: 'Segment proxy error' });
      }
    });

    try {
      console.log('🔧 Setting up API routes...');
      const apiRoutes = createApiRoutes(serverConfig, streamManager);
      app.use('/', apiRoutes);
      
      // Add HTTP streaming routes
      if (httpStreamServer) {
        app.use('/api', httpStreamServer.getRouter());
        console.log('🌐 HTTP streaming routes mounted');
      }
      
      console.log('✅ All routes mounted successfully');
    } catch (error) {
      console.error('❌ Failed to setup routes:', error);
      throw error;
    }

    setupErrorHandling(app);
    console.log('✅ Express setup complete - all endpoints ready');
  }
}

module.exports = ExpressSetup;