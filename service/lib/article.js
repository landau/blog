'use strict';

const Odm = require('./odm');
const Joi = Odm.Joi;
const P = require('predicate');

const COLLECTION_NAME = 'articles';

let internals = {};
internals.schema = {
  hed: Joi.string().required(),
  dek: Joi.string(),
  body: Joi.string().required(),
  tags: Joi.array().items(Joi.string()),
  uri: Joi.string().regex(/^[a-z0-9-]+$/),
  published: Joi.boolean()
};

module.exports = (odm) => {
  let Article = odm.createModel(COLLECTION_NAME, internals.schema);

  Article.hasUri = (uri) => {
    return Article.findOne({ uri: uri }).then(P.exists);
  };

  return Article;
};

module.exports.internals = internals;
