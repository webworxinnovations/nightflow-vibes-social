
class ProcessHandlers {
  constructor(server, mediaServer, wsHandler) {
    this.server = server;
    this.mediaServer = mediaServer;
    this.wsHandler = wsHandler;
    this.keepAliveInterval = null;
  }

  setupKeepAlive(streamManager, serverConfig) {
    this.keepAliveInterval = setInterval(() => {
      try {
        const uptime = Math.floor(process.uptime());
        const streamCount = streamManager ? streamManager.getStreamCount() : 0;
        const rtmpStatus = this.mediaServer ? 'RUNNING' : 'FAILED';
        console.log(`💓 Server Status - API:${serverConfig.RAILWAY_PORT} RTMP:${rtmpStatus} - Uptime: ${uptime}s - Streams: ${streamCount}`);
        
        if (!this.mediaServer) {
          console.log('🚨 RTMP server is not running - this is why OBS fails!');
        }
      } catch (error) {
        console.error('❌ Keep alive error:', error);
      }
    }, 30000);
  }

  setupGracefulShutdown() {
    const gracefulShutdown = (signal) => {
      console.log(`${signal} received - shutting down gracefully`);
      
      if (this.keepAliveInterval) {
        clearInterval(this.keepAliveInterval);
      }
      
      if (this.wsHandler && this.wsHandler.wss) {
        this.wsHandler.wss.close(() => {
          console.log('✅ WebSocket server closed');
        });
      }
      
      if (this.mediaServer) {
        try {
          this.mediaServer.stop();
          console.log('✅ Media server stopped');
        } catch (error) {
          console.error('❌ Error stopping media server:', error);
        }
      }
      
      if (this.server) {
        this.server.close(() => {
          console.log('✅ HTTP server closed gracefully');
          process.exit(0);
        });
      }
      
      setTimeout(() => {
        console.log('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }

  setupErrorHandlers() {
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      
      if (error.message && (
        error.message.includes('getFfmpegVersion') || 
        error.message.includes('ffmpeg') ||
        error.stack && error.stack.includes('node-media-server')
      )) {
        console.log('🔧 Node Media Server internal error - this won\'t affect streaming');
        return;
      }
      
      console.error('This is a critical error - shutting down');
      this.gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      
      if (reason && reason.message && (
        reason.message.includes('getFfmpegVersion') ||
        reason.message.includes('ffmpeg')
      )) {
        console.log('🔧 Node Media Server internal rejection - this won\'t affect streaming');
        return;
      }
      
      console.error('This is a critical rejection - shutting down');
      this.gracefulShutdown('UNHANDLED_REJECTION');
    });
  }
}

module.exports = ProcessHandlers;
