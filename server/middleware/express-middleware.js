
const express = require('express');

function setupMiddleware(app) {
  console.log('🔧 Setting up Express middleware...');
  
  // CORS middleware - must be first and more permissive for streaming
  app.use((req, res, next) => {
    // Allow all origins for streaming compatibility
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Range');
    
    // Additional headers for HLS streaming
    res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
    res.header('Access-Control-Allow-Credentials', 'false');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    next();
  });

  // JSON parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Request logging middleware
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
    next();
  });

  // Additional middleware specifically for streaming files
  app.use('/live', (req, res, next) => {
    // Set cache headers for streaming
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    
    // Set content type for HLS files
    if (req.path.endsWith('.m3u8')) {
      res.header('Content-Type', 'application/vnd.apple.mpegurl');
    } else if (req.path.endsWith('.ts')) {
      res.header('Content-Type', 'video/mp2t');
    }
    
    next();
  });

  console.log('✅ Express middleware configured with enhanced CORS for streaming');
}

module.exports = { setupMiddleware };
