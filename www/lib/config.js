'use strict';

module.exports = {
  name: process.env.NODE_NAME || 'blog-www',
  debug: process.env.NODE_DEBUG || false,
  env: process.env.NODE_ENV || 'development',
  port: process.env.NODE_PORT || 8082,
  serviceurl: process.env.NODE_SERVICEURL || 'http://localhost:8081'
};
