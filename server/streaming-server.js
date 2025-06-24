
const express = require('express');
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
  
  // Start the server
  try {
    const server = await startup.startServer(app);
    
    // Setup process handlers
    const processHandlers = new ProcessHandlers(
      server, 
      app.locals.mediaServer, 
      app.locals.wsHandler
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
