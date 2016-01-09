'use strict';

let internals = {};

internals.home = (request, reply) => {
  reply({ ok: true });
};

module.exports = (server) => {
  // -- ping
  server.route({
    method: 'GET',
    path: '/ping',
    config: {
      handler: (request, reply) => {
        reply({
          version: request.server.app.version,
          config: request.server.app.config
        });
      },
      tags: ['healthcheck', 'ping']
    }
  });

  // -- home
  server.route({
    method: 'GET',
    path: '/',
    config: {
      handler: internals.home,
      tags: ['root', 'home']
    }
  });

  return server;
};

module.exports.internals = internals;
