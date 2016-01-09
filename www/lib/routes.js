'use strict';

let internals = {};

internals.home = (request, reply) => {
  reply.view('index', {
    articles: [{
      hed: 'foo',
      dek: 'bar',
      body: 'i need to rendered from markdown. i need to rendered from markdown. i need to rendered from markdown. i need to rendered from markdown.',
      published: true,
      uri: 'todo-i-need-to-be-rendered-from-markdown',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    }]
  });
};

internals.post = (request, reply) => {
  reply.view('article', {
    article: {
      hed: 'foo',
      dek: 'bar',
      body: 'i need to rendered from markdown. i need to rendered from markdown. i need to rendered from markdown. i need to rendered from markdown.',
      published: true,
      uri: 'todo-i-need-to-be-rendered-from-markdown',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    }
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

  // -- /post
  server.route({
    method: 'GET',
    path: '/post/{uri}',
    config: {
      handler: internals.post,
      tags: ['article', 'post']
    }
  });

  return server;
};

module.exports.internals = internals;
