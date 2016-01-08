'use strict';

var internals = {};

internals.handler = (request, reply) => {
  reply({
    version: request.server.app.version,
    config: request.server.app.config
  });
};

module.exports = (server) => {
  server.route({
    method: 'GET',
    path: '/ping',
    config: {
      handler: internals.handler,
      tags: ['healthcheck', 'ping']
    }
  });

  return server;
};

module.exports.internals = internals;
