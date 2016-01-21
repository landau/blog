'use strict';

module.exports = {
  name: process.env.NODE_NAME || 'blog-www',
  debug: process.env.NODE_DEBUG || false,
  env: process.env.NODE_ENV || 'development',
  port: process.env.NODE_PORT || 8103,
  serviceurl: process.env.NODE_SERVICEURL || 'http://localhost:8100',
  pagination: {
    index: parseInt(process.env.NODE_PAGINATION_INDEX, 10) || 8
  }
};
