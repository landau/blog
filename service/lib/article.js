'use strict';

const Odm = require('./odm');
const Joi = Odm.Joi;

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
  return Article;
};

module.exports.internals = internals;
