'use strict';

module.exports = {
  name: process.env.NODE_NAME || 'blog-service',
  debug: process.env.NODE_DEBUG || false,
  env: process.env.NODE_ENV || 'development',
  port: process.env.NODE_PORT || 8080,
  mongodb: process.env.NODE_MONGODB || 'mongodb://localhost:27017/blog-service',
  cors: {
    origins: (process.env.NODE_CORS_ORIGINS || '').split(',') || []
  }
};
