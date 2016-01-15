'use strict';

const Joi = require('joi');
const boom = require('boom');
const createArticle = require('../article');
const _ = require('lodash');

let internals = {};

internals.find = (request, reply) => {
  const Article = request.server.app.Article;

  let query = {};

  if (request.query.tags) {
    const tags = request.query.tags.split(',');
    if (tags.length) {
      query.tags = {
        $in: tags
      };
    }
  }

  let articles = Article.all(query, request.query.limit, request.query.skip)
    .then((articles) => articles.map(_.property('fields')));

  let p = Promise.all([articles, Article.count(query)])
    .then((results) => {
      const articles = results[0];
      const total = results[1];

      return {
        page: request.query.skip + 1,
        total: total,
        data: articles
      };
    });

  reply(p);
};

internals.findById = (request, reply) => {
  const Article = request.server.app.Article;
  const id = request.params.id;

  let p = Article.findById(id)
    .then((article) => {
      if (!article) {
        return boom.notFound(`Article not found with id ${id}`, request.params);
      }

      return article.fields;
    });

  reply(p);
};

internals.save = (request, reply) => {
  const Article = request.server.app.Article;
  const payload = request.payload;
  let article = new Article(payload);
  reply(article.save().then(_.property('fields'))).code(201);
};

internals.update = (request, reply) => {
  const Article = request.server.app.Article;
  const payload = request.payload;

  let p = Article.findById(request.params.id)
    .then((article) => {
      if (!article) {
        return boom.notFound(`Article not found with id ${id}`, request.params);
      }

      return article.update(payload);
    })
    .then(_.property('fields'));

  reply(p);
};

internals.findPublished = (request, reply) => {
  const Article = request.server.app.Article;
  let query = _.pick(request.query, ['id', 'uri']); // Only one of these is possible thanks to x0r
  query.published = true;

  let p = Article.findOne(query)
    .then((article) => {
      if (!article) {
        return boom.notFound(`Article not found with query ${JSON.stringify(query)}`, request.params);
      }

      return article.fields;
    });

  reply(p);
};

internals.findLatestPublished = (request, reply) => {
  const Article = request.server.app.Article;

  let query = {
    published: true
  };

  if (request.query.tags) {
    const tags = request.query.tags.split(',');
    if (tags.length) {
      query.tags = {
        $in: tags
      };
    }
  }

  let articles = Article.all(query, request.query.limit, request.query.skip)
    .then((articles) => articles.map(_.property('fields')));

  let p = Promise.all([articles, Article.count(query)])
    .then((results) => {
      const articles = results[0];
      const total = results[1];

      return {
        page: request.query.skip + 1,
        total: total,
        data: articles
      };
    });

  reply(p);
};

module.exports = (server) => {
  const JOI_ID = Joi.string().regex(/^[a-zA-Z0-9]{24}$/);
  const JOI_PUBLISHED = createArticle.internals.schema.uri;

  // -- Find routes
  server.route({
    method: 'GET',
    path: '/articles',
    config: {
      validate: {
        query: {
          limit: Joi.number(),
          skip: Joi.number().default(0),
          tags: Joi.string().default('')
        }
      },
      handler: internals.find,
      tags: ['articles', 'find']
    }
  });

  server.route({
    method: 'GET',
    path: '/articles/{id}',
    config: {
      validate: {
        params: {
          id: JOI_ID
        }
      },
      handler: internals.findById,
      tags: ['articles', 'find']
    }
  });

  server.route({
    method: 'GET',
    path: '/articles/published/latest',
    config: {
      validate: {
        query: {
          limit: Joi.number(),
          skip: Joi.number().default(0),
          tags: Joi.string().default('')
        }
      },
      handler: internals.findLatestPublished,
      tags: ['articles', 'find', 'publish']
    }
  });

  server.route({
    method: 'GET',
    path: '/articles/published',
    config: {
      validate: {
        query: Joi.object().keys({
          id: JOI_ID,
          uri: JOI_PUBLISHED
        }).xor('id', 'uri')
      },
      handler: internals.findPublished,
      tags: ['articles', 'find', 'published']
    }
  });

  // -- Actionable routes
  server.route({
    method: 'POST',
    path: '/articles',
    config: {
      validate: {
        payload: createArticle.internals.schema
      },
      handler: internals.save,
      tags: ['articles', 'save']
    }
  });

  server.route({
    method: 'PUT',
    path: '/articles/{id}',
    config: {
      validate: {
        params: {
          id: JOI_ID
        },
        payload: createArticle.internals.schema
      },
      handler: internals.update,
      tags: ['articles', 'update']
    }
  });

  return server;
};
