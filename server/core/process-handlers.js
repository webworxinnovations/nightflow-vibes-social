class ProcessHandlers {
  constructor(server, mediaServer, wsHandler) {
    this.server = server;
    this.mediaServer = mediaServer;
    this.wsHandler = wsHandler;
    this.keepAliveInterval = null;
    this.isRailway = !!process.env.RAILWAY_ENVIRONMENT;
  }

  setupKeepAlive(streamManager, serverConfig) {
    // Adjust keep-alive frequency for Railway
    const keepAliveInterval = this.isRailway ? 45000 : 30000; // 45s for Railway, 30s for local
    
    this.keepAliveInterval = setInterval(() => {
      try {
        const uptime = Math.floor(process.uptime());
        const streamCount = streamManager ? streamManager.getStreamCount() : 0;
        const rtmpStatus = this.mediaServer ? 'RUNNING' : 'INITIALIZING';
        
        if (this.isRailway) {
          console.log(`🚄 Railway Status - Port:${serverConfig.RAILWAY_PORT} RTMP:${rtmpStatus} - Uptime: ${uptime}s - Streams: ${streamCount}`);
          
          // Railway-specific health indicators
          if (uptime > 120 && !this.mediaServer) {
            console.log('🚨 Railway: RTMP server not running after 2 minutes - port configuration issue');
          }
          
          // Memory usage for Railway monitoring
          const memUsage = process.memoryUsage();
          const memMB = Math.round(memUsage.heapUsed / 1024 / 1024);
          console.log(`🚄 Railway Memory: ${memMB}MB heap used`);
          
        } else {
          console.log(`💓 Local Status - API:${serverConfig.RAILWAY_PORT} RTMP:${rtmpStatus} - Uptime: ${uptime}s - Streams: ${streamCount}`);
        }
        
      } catch (error) {
        console.error('❌ Keep alive error:', error);
      }
    }, keepAliveInterval);
  }

  setupGracefulShutdown() {
    const gracefulShutdown = (signal) => {
      console.log(`${signal} received - ${this.isRailway ? 'Railway' : 'Local'} graceful shutdown`);
      
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
          console.log(`✅ ${this.isRailway ? 'Railway' : 'Local'} HTTP server closed gracefully`);
          process.exit(0);
        });
      }
      
      // Force exit after timeout (shorter for Railway)
      const forceExitTimeout = this.isRailway ? 8000 : 10000;
      setTimeout(() => {
        console.log(`❌ Forced shutdown after ${forceExitTimeout/1000}s timeout`);
        process.exit(1);
      }, forceExitTimeout);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }

  setupErrorHandlers() {
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      
      // Railway-specific error handling
      if (this.isRailway) {
        console.log('🚄 Railway uncaught exception detected');
        
        // Don't exit for known Railway networking issues
        if (error.message && (
          error.message.includes('EADDRINUSE') ||
          error.message.includes('EACCES') ||
          error.message.includes('port 1935')
        )) {
          console.log('🚄 Railway port binding issue - this is expected for RTMP');
          console.log('🚄 API server continues running normally');
          return;
        }
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
      
      // Railway-specific rejection handling
      if (this.isRailway && reason && reason.message) {
        if (reason.message.includes('port 1935') || reason.message.includes('RTMP')) {
          console.log('🚄 Railway RTMP rejection - this is expected');
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
