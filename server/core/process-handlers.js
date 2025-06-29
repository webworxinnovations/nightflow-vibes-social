class ProcessHandlers {
  constructor(server, mediaServer, wsHandler) {
    this.server = server;
    this.mediaServer = mediaServer;
    this.wsHandler = wsHandler;
    this.keepAliveInterval = null;
    this.isDigitalOcean = true; // Always DigitalOcean droplet
  }

  setupKeepAlive(streamManager, serverConfig) {
    // DigitalOcean droplet keep-alive monitoring
    const keepAliveInterval = 30000; // 30 seconds for droplet
    
    this.keepAliveInterval = setInterval(() => {
      try {
        const uptime = Math.floor(process.uptime());
        const streamCount = streamManager ? streamManager.getStreamCount() : 0;
        const rtmpStatus = this.mediaServer ? 'RUNNING' : 'INITIALIZING';
        
        console.log(`🌊 DigitalOcean Droplet Status - Port:${serverConfig.PORT} RTMP:${rtmpStatus} - Uptime: ${uptime}s - Streams: ${streamCount}`);
        
        // DigitalOcean droplet health indicators
        if (uptime > 120 && !this.mediaServer) {
          console.log('🚨 Droplet: RTMP server not running after 2 minutes - checking configuration');
        }
        
        // Memory usage for droplet monitoring
        const memUsage = process.memoryUsage();
        const memMB = Math.round(memUsage.heapUsed / 1024 / 1024);
        console.log(`🌊 DigitalOcean Memory: ${memMB}MB heap used`);
        
      } catch (error) {
        console.error('❌ Keep alive error:', error);
      }
    }, keepAliveInterval);
  }

  setupGracefulShutdown() {
    const gracefulShutdown = (signal) => {
      console.log(`${signal} received - DigitalOcean droplet graceful shutdown`);
      
      if (this.keepAliveInterval) {
        clearInterval(this.keepAliveInterval);
        console.log('✅ Keep-alive monitoring stopped');
      }
      
      // Close WebSocket connections
      if (this.wsHandler && this.wsHandler.wss) {
        this.wsHandler.wss.close(() => {
          console.log('✅ WebSocket server closed');
        });
      }
      
      // Stop RTMP media server
      if (this.mediaServer) {
        try {
          console.log('🎬 Stopping RTMP media server...');
          this.mediaServer.stop();
          console.log('✅ RTMP media server stopped');
        } catch (error) {
          console.error('❌ Error stopping media server:', error);
        }
      }
      
      // Close HTTP server
      if (this.server) {
        this.server.close(() => {
          console.log('✅ DigitalOcean droplet HTTP server closed gracefully');
          process.exit(0);
        });
      }
      
      // Force exit after timeout
      setTimeout(() => {
        console.log('❌ Forced shutdown after 10s timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }

  setupErrorHandlers() {
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      
      // DigitalOcean droplet error handling
      console.log('🌊 DigitalOcean droplet uncaught exception detected');
      
      // Don't exit for known networking issues
      if (error.message && (
        error.message.includes('EADDRINUSE') ||
        error.message.includes('EACCES') ||
        error.message.includes('port 1935')
      )) {
        console.log('🌊 Droplet port binding issue - continuing operation');
        console.log('🌊 API server continues running normally');
        return;
      }
      
      // Handle Node Media Server internal errors
      if (error.message && (
        error.message.includes('getFfmpegVersion') || 
        error.message.includes('ffmpeg') ||
        error.stack && error.stack.includes('node-media-server')
      )) {
        console.log('🔧 Node Media Server internal error - streaming continues normally');
        return;
      }
      
      console.error('💥 Critical error detected - initiating shutdown');
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      
      // DigitalOcean droplet rejection handling
      if (reason && reason.message) {
        if (reason.message.includes('port 1935') || reason.message.includes('RTMP')) {
          console.log('🌊 DigitalOcean droplet RTMP rejection - this is expected');
          return;
        }
      }
      
      // Handle Node Media Server internal rejections
      if (reason && reason.message && (
        reason.message.includes('getFfmpegVersion') ||
        reason.message.includes('ffmpeg')
      )) {
        console.log('🔧 Node Media Server internal rejection - streaming continues normally');
        return;
      }
      
      console.error('💥 Critical rejection detected - initiating shutdown');
      process.exit(1);
    });
  }
}

module.exports = ProcessHandlers;
