'use strict';

const request = require('request-promise');
const P = require('predicate');
const Joi = require('joi');
const _ = require('lodash');
const Boom = require('boom');
const slug = require('slug');

function replyBoom(reply) {
  reply(Boom.create.apply(Boom, _.tail(arguments)));
}

function catchReply(reply) {
  return (err) => {
    if (err.isBoom) {
      return reply(err);
    }

    replyBoom(reply, err.statusCode, err.message);
  };
}

let internals = {};

internals.index = (req, reply) => {
  const log = req.server.app.logger.child({ view: 'index' });
  const MAX_PER_PAGE = req.server.app.config.pagination.index;
  const page = req.query.page || 1;
  const SERVICE_URL = req.server.app.config.serviceurl;

  let articlesUrl = `${SERVICE_URL}/articles/published/latest?limit=${MAX_PER_PAGE}`;

  if (!req.query.live) {
    articlesUrl = `${SERVICE_URL}/articles?limit=${MAX_PER_PAGE}`;
  }

  if (P.num(page) && page > 1) { // base site page is 1, no need to add skip
    // The site's page base is 1 and api is 0, therefore `page - 1`
    articlesUrl += `&skip=${MAX_PER_PAGE * (page - 1)}`;
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

  Promise.all(promises)
    .then((results) => {
      const articleResult = results[0];
      const tagsResult = results[1];

      const NEXT_PAGE = page + 1;
      const hasNextPage = articleResult.total > MAX_PER_PAGE * (NEXT_PAGE - 1);

      reply.view('index', {
        articles: articleResult.data,
        nextPage: NEXT_PAGE,
        hasNextPage: hasNextPage,
        isLive: req.query.live,
        tags: tagsResult.data
      });
    })
    .catch(catchReply(reply));
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
    .catch(catchReply(reply));
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
        isLive: req.query.live
      });
    })
    .catch(catchReply(reply));
};

internals.save = (req, reply) => {
  const SERVICE_URL = req.server.app.config.serviceurl;
  let article = req.payload;

  if (!article.published) {
    article.published = false;
  }

  if (article.uri) {
    article.uri = slug(article.uri);
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
      reply.view('article-created', {
        article: article
      }).code(201);
   })
   .catch(catchReply(reply));
};

internals.error = (req, reply) => {
  if (req.response.isBoom) {
    const err = req.response;
    const errName = err.output.payload.error;
    const statusCode = err.output.payload.statusCode;

    return reply.view('status-page', {
        statusCode: statusCode,
        message: errName
      })
      .code(statusCode);
  }

  reply.continue();
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
      validate: {
        query: {
          live: Joi.boolean().default(true).invalid(false)
        }
      },
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
      validate: {
        query: {
          live: Joi.boolean().default(false)
        }
      },
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

  server.ext('onPreResponse', internals.error);

  return server;
};

module.exports.internals = internals;
