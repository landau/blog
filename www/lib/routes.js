'use strict';

const request = require('request-promise');
const P = require('predicate');
const Joi = require('joi');
const _ = require('lodash');

let internals = {};

internals.index = (req, reply) => {
  const log = req.server.app.logger.child({ view: 'index' });
  const MAX_PAGE = 4; // TODO: ENV VAR
  const page = req.query.page || 1;
  const SERVICE_URL = req.server.app.config.serviceurl;

  let articlesUrl = `${SERVICE_URL}/articles/published/latest?limit=${MAX_PAGE}`;

  if (!req.query.live) {
    articlesUrl = `${SERVICE_URL}/articles?limit=${MAX_PAGE}`;
  }

  if (P.num(page) && page > 1) { // base site page is 1, no need to add skip
    // The site's page base is 1 and api is 0, therefore `page - 1`
    articlesUrl += `&skip=${MAX_PAGE * (page - 1)}`;
  }

  if (req.params.tags) {
    articlesUrl += `&tags=${req.params.tags}`;
  }

  const articleOpts = {
    url: articlesUrl,
    json: true
  };

  const tagsOpts = {
    url: `${SERVICE_URL}/tags?published=${req.query.live}`,
    json: true
  };

  log.info(articleOpts.url);
  log.info(tagsOpts.url);

  const promises = [
    request(articleOpts),
    request(tagsOpts)
  ];

  // TODO: Handle empty collection
  Promise.all(promises)
    .then((results) => {
      const articleResult = results[0];
      const tagsResult = results[1];

      const NEXT_PAGE = page + 1;
      const hasNextPage = articleResult.total > MAX_PAGE * (NEXT_PAGE - 1);

      reply.view('index', {
        articles: articleResult.data,
        nextPage: NEXT_PAGE,
        hasNextPage: hasNextPage,
        isLive: req.query.live,
        tags: tagsResult.data
      });
    })
    .catch(reply);
};

internals.getPost = (req, reply) => {
  const SERVICE_URL = req.server.app.config.serviceurl;
  const opts = {
    url: `${SERVICE_URL}/articles/published?uri=${req.params.uri}`,
    json: true
  };

  request(opts).then((article) => {
      req.server.app.logger.info(_.omit(article, ['body']));

      reply.view('article', {
        article: article,
        isLive: true
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
    url: `${SERVICE_URL}/articles/${req.params.id}`,
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
  let article = req.payload;

  if (!article.published) {
    article.published = false;
  }

  if (typeof article.tags === 'string') {
    article.tags = article.tags.split(',');
  }

  let opts = {
    url: `${SERVICE_URL}/articles`,
    method: 'POST',
    json: article
  };

  // Update!
  if (req.params.id) {
    opts.url += `/${req.params.id}`;
    opts.method = 'PUT';
  }

  // TODO change to redirect page
  request[opts.method.toLowerCase()](opts).then((article) => {
     reply.redirect(`/admin/post/${article.id}`);
   })
   .catch(reply);
};

module.exports = (server) => {
  // TODO: admin validation
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
          page: Joi.number().integer().positive().optional().min(1),
          live: Joi.boolean().default(true).invalid(false)
        }
      },
      handler: internals.index,
      tags: ['root', 'index']
    }
  });

  // -- posts found with {tags}
  server.route({
    method: 'GET',
    path: '/tags/{tags}',
    config: {
      validate: {
        params: {
          tags: Joi.string() // TODO: more strict?
        },
        query: {
          page: Joi.number().integer().positive().optional().min(1),
          live: Joi.boolean().default(true).invalid(false)
        }
      },
      handler: internals.index,
      tags: ['root', 'index', 'tags']
    }
  });

  // -- admin home
  server.route({
    method: 'GET',
    path: '/admin',
    config: {
      validate: {
        query: {
          page: Joi.number().integer().positive().optional().min(1),
          live: Joi.boolean().default(false)
        }
      },
      handler: internals.index,
      tags: ['root', 'index', 'admin']
    }
  });

  // -- /post
  server.route({
    method: 'GET',
    path: '/post/{uri}',
    config: {
      handler: internals.getPost,
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

  // -- edit existing post
  server.route({
    method: 'GET',
    path: '/admin/post/{id}',
    config: {
      handler: internals.editPost,
      tags: ['article', 'post', 'edit']
    }
  });

  // -- new post
  server.route({
    method: ['POST', 'PUT'],
    path: '/admin/post',
    config: {
      handler: internals.save,
      tags: ['article', 'post', 'create']
    }
  });

  // -- update post
  server.route({
    method: 'POST',
    path: '/admin/post/{id}',
    config: {
      handler: internals.save,
      tags: ['article', 'post', 'edit', 'update']
    }
  });

  return server;
};

module.exports.internals = internals;
