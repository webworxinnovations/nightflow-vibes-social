
const express = require('express');
const https = require('https');
const http = require('http');
const ServerStartup = require('./core/server-startup');
const ProcessHandlers = require('./core/process-handlers');

const app = express();

async function main() {
  const startup = new ServerStartup();
  
  // Initialize server components
  await startup.initialize();
  
  // Setup Express app
  startup.setupExpress(app);
  
  console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Media Root: ${startup.getServerConfig().mediaRoot}`);
  
  const serverConfig = startup.getServerConfig();
  
  // Start the server(s)
  try {
    let server;
    let httpsServer;
    
    // Always start HTTP server
    server = http.createServer(app);
    server.listen(serverConfig.DROPLET_PORT, '0.0.0.0', () => {
      console.log(`🌐 HTTP Server running on port ${serverConfig.DROPLET_PORT}`);
      console.log(`🔗 HTTP API: http://67.205.179.77:${serverConfig.DROPLET_PORT}`);
    });
    
    // Start HTTPS server if SSL is enabled and certificates exist
    if (serverConfig.SSL_ENABLED) {
      const sslOptions = serverConfig.getSSLOptions();
      if (sslOptions) {
        httpsServer = https.createServer(sslOptions, app);
        httpsServer.listen(serverConfig.HTTPS_PORT, '0.0.0.0', () => {
          console.log(`🔒 HTTPS Server running on port ${serverConfig.HTTPS_PORT}`);
          console.log(`🔗 HTTPS API: https://67.205.179.77:${serverConfig.HTTPS_PORT}`);
          console.log(`✅ SSL/TLS enabled - NightFlow app can now connect securely!`);
        });
      } else {
        console.log(`⚠️ SSL certificates not found. Only HTTP server will run.`);
        console.log(`💡 To enable HTTPS, add SSL certificates and set SSL_ENABLED=true`);
      }
    }
    
    // Setup process handlers
    const processHandlers = new ProcessHandlers(
      server, 
      app.locals.mediaServer, 
      app.locals.wsHandler,
      httpsServer
    );
    
    processHandlers.setupKeepAlive(startup.getStreamManager(), startup.getServerConfig());
    processHandlers.setupGracefulShutdown();
    processHandlers.setupErrorHandlers();
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the application
main().catch((error) => {
  console.error('❌ Fatal error during startup:', error);
  process.exit(1);
});
