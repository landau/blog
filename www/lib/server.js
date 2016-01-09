'use strict';

const path = require('path');
const Hapi = require('hapi');
const config = require('./config');
const logging = require('./logging');
const engine = require('hapi-react')();

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
  version: require('../package.json').version,
  config: config,
  logger: logging.logger
};

server.register(require('vision'), (err) => {
  require('assert').ifError(err);

  server.views({
    defaultExtension: 'jsx',
    engines: {
      jsx: engine, // support for .jsx files
      js: engine // support for .js
    },
    relativeTo: __dirname,
    path: 'views'
  });

});

server.connection({
  port: config.port,
  routes: {
    validate: {
      options: {
        abortEarly: false,
        stripUnknown: true
      }
    }
  }
});

logging.attach(server);

module.exports = server;
