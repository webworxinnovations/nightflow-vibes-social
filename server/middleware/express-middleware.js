
const express = require('express');
const cors = require('cors');

function setupMiddleware(app) {
  // Enhanced CORS configuration
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: false
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
}

module.exports = { setupMiddleware };
