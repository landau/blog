'use strict';

const Hapi = require('hapi');
const config = require('./config');
const logging = require('./logging');

const server = new Hapi.Server({
  debug: false,
  connections: {
    router: {
      isCaseSensitive: false,
      stripTrailingSlash: true
    }
  }
});

server.app = {
  version: require('../../version.json'),
  config: config,
  logger: logging.logger
};

server.connection({
  port: config.port,
  routes: {
    validate: {
      options: {
        abortEarly: false,
        stripUnknown: true
      }
    },
    cors: {
      origin: config.cors.origins
    }
  }
});

logging.attach(server);

module.exports = server;
