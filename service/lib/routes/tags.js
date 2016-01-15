'use strict';

const Joi = require('joi');
const _ = require('lodash');

let internals = {};

internals.find = (request, reply) => {
  const Article = request.server.app.Article;

  let query = {};

  if (request.query.published) {
    query.published = true;
  }

  let tags = Article.all(query, request.query.limit, request.query.skip)
    .then((articles) => articles.map(_.property('fields')))
    .then((articles) => {
      return articles.map(_.property('tags'));
    })
    .then(_.flatten)
    .then(_.uniq);

  let p = Promise.all([tags, Article.count(query)])
    .then((results) => {
      const tags = results[0];
      const total = results[1];

      return {
        page: request.query.skip + 1,
        total: total,
        data: tags
      };
    });

  reply(p);
};

module.exports = (server) => {

  // -- Find routes
  server.route({
    method: 'GET',
    path: '/tags',
    config: {
      validate: {
        query: {
          limit: Joi.number(),
          skip: Joi.number().default(0),
          published: Joi.boolean().default(false)
        }
      },
      handler: internals.find,
      tags: ['tags', 'find']
    }
  });


  return server;
};
