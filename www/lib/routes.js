'use strict';

let internals = {};

internals.home = (request, reply) => {
  reply.view('index', {
    articles: [{
      hed: 'foo',
      dek: 'bar',
      body: 'i need to rendered from markdown',
      published: true,
      uri: 'todo-i-need-to-be-rendered-from-markdown'
    }]
  });
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
