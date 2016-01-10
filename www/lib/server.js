'use strict';

const assert = require('assert');
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

// -- App vars
server.app = {
  version: require('../package.json').version,
  config: config,
  logger: logging.logger
};

// -- Setup hapi-react
server.register(require('vision'), (err) => {
  assert.ifError(err);

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

// -- Server config
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

// -- Server static files when not prod
if (config.env !== 'production') {
  server.register(require('inert'), (err) => {
    assert.ifError(err);

    server.route({
      method: 'GET',
      path: '/{param*}', // Does this need to be /public?
      handler: {
        directory: {
          path: 'public'
        }
      }
    });
  });
}

logging.attach(server);

module.exports = server;
