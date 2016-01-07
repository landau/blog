'use strict';

const Odm = require('./odm');
const Joi = Odm.joi;

const COLLECTION_NAME = 'articles';

module.exports = (odm) => {
  var schema = {
   hed: Joi.string().required(),
   dek: Joi.string(),
   body: Joi.string().required(),
   tags: Joi.items(Joi.string()),
   uri: Joi.string(),
   published: Joi.boolean()
 };

 return odm.createModel(COLLECTION_NAME, schema);
};
