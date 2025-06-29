
const { setupMiddleware, createApiRoutes, setupErrorHandling } = require('../routes/api-routes');

class ExpressSetup {
  static setupApp(app, serverConfig, streamManager, httpStreamServer) {
    try {
      setupMiddleware(app, serverConfig);
      console.log('✅ Middleware setup complete');
    } catch (error) {
      console.error('❌ Failed to setup middleware:', error);
      throw error;
    }

    try {
      console.log('🔧 Setting up Express routes...');
      const apiRoutes = createApiRoutes(serverConfig, streamManager);
      app.use('/', apiRoutes);
      
      // Add HTTP streaming routes
      app.use('/api', httpStreamServer.getRouter());
      console.log('🌐 HTTP streaming routes mounted');
      
      console.log('✅ Routes mounted successfully');
    } catch (error) {
      console.error('❌ Failed to setup routes:', error);
      throw error;
    }

    setupErrorHandling(app);
    
    // Enhanced health check endpoint for DigitalOcean
    this.setupHealthEndpoints(app, serverConfig);
  }

  static setupHealthEndpoints(app, serverConfig) {
    app.get('/health', (req, res) => {
      const healthData = {
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
            port: serverConfig.HLS_PORT,
            url: `http://67.205.179.77:${serverConfig.HLS_PORT}/live`
          },
          api: {
            ready: true,
            status: 'operational',
            port: serverConfig.DROPLET_PORT
          }
        }
      };
      res.json(healthData);
    });

    app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        rtmp_ready: true,
        api_ready: true,
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        droplet_ip: '67.205.179.77'
      });
    });
  }
}

module.exports = ExpressSetup;
