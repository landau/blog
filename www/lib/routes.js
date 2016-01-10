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
        live: false
      });
    })
    .catch(reply);
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

  return server;
};

module.exports.internals = internals;
