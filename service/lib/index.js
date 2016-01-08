'use strict';

const config = require('./config');
const Odm = require('./odm');
const createArticleModel = require('./article');
const server = require('./server');
const routes = require('./routes');

module.exports = () => {
  return Odm.connect(config.mongodb)
    .then(createArticleModel)
    .then(function(Article) {
      server.app.Article = Article;
      routes.forEach((r) => r(server));
      return server;
    });
};
