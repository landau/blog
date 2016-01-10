'use strict';

const request = require('request-promise');
const P = require('predicate');
const Joi = require('joi');

let internals = {};

internals.index = (req, reply) => {
  const page = req.query.page || 1;
  const SERVICE_URL = req.server.app.config.serviceurl;
  let url = `${SERVICE_URL}/articles/published/latest?limit=4`;

  if (P.num(page) && page > 1) { // base site page is 1, no need to add skip
    // The site's page base is 1 and api is 0, therefore `page - 1`
    url += `&skip=${page - 1}`;
  }

  const opts = {
    url: url,
    json: true
  };

  // TODO: Handle empty collection
  request(opts).then((articles) => {
      reply.view('index', {
        articles: articles,
        nextPage: page + 1
      });
    })
    .catch(reply);
};

internals.post = (req, reply) => {
  const SERVICE_URL = req.server.app.config.serviceurl;
  const opts = {
    url: `${SERVICE_URL}/articles/published?uri=${req.params.uri}`,
    json: true
  };

  request(opts).then((article) => {
      reply.view('article', {
        article: article,
        live: true
      });
    })
    .catch(reply);
};

internals.newPost = (req, reply) => {
  reply.view('article', {
    article: {},
    isLive: false
  });
};

internals.editPost = (req, reply) => {

  const SERVICE_URL = req.server.app.config.serviceurl;
  const opts = {
    url: `${SERVICE_URL}/articles/published?uri=${req.params.uri}`,
    json: true
  };

  request(opts).then((article) => {
      reply.view('article', {
        article: article,
        isLive: false
      });
    })
    .catch(reply);
};

internals.save = (req, reply) => {
  const SERVICE_URL = req.server.app.config.serviceurl;
  const article = request.payload;
  console.log(11, article);
  let opts = {
    url: `${SERVICE_URL}/articles`,
    method: 'POST',
    json: true,
    payload: article
  };

  if (article.id) {
    opts.url += `/${article.id}`;
    opts.method = 'PUT';
  }

  reply.view('article', { article: article, isLive: false }).code(201);

  //request(opts).then((article) => {
  //    reply.view('article', {
  //      article: article,
  //      isLive: false
  //    });
  //  })
  //  .catch(reply);
};

module.exports = (server) => {
  // -- ping
  server.route({
    method: 'GET',
    path: '/ping',
    config: {
      handler: (request, reply) => {
        reply({
          version: request.server.app.version
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
      validate: {
        query: {
          page: Joi.number().integer().positive().optional().min(1)
        }
      },
      handler: internals.index,
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

  // -- new post
  server.route({
    method: 'GET',
    path: '/admin/post',
    config: {
      handler: internals.newPost,
      tags: ['article', 'post', 'new']
    }
  });

  // -- new post
  server.route({
    method: 'POST',
    path: '/admin/post',
    config: {
      handler: internals.save,
      tags: ['article', 'post', 'create']
    }
  });

  // -- edit existing post
  server.route({
    method: 'GET',
    path: '/admin/post/{uri}',
    config: {
      handler: internals.editPost,
      tags: ['article', 'post', 'edit']
    }
  });

  // -- update post
  server.route({
    method: 'PUT',
    path: '/admin/post/{uri}',
    config: {
      handler: internals.save,
      tags: ['article', 'post', 'edit', 'update']
    }
  });

  return server;
};

module.exports.internals = internals;
