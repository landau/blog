'use strict';

const Joi = require('joi');
const _ = require('lodash');
const bson = require('bson');
const mongodb = require('mongodb');

exports.Joi = Joi;

let internals = exports.internals = {};

function isValidWriteResult(writeResult) {
  return writeResult.result &&
    writeResult.result.ok &&
    (writeResult.ops && writeResult.ops.length) ||
    (writeResult.result.nModified > 0);
}

function extractResult(writeResult) {

  return new Promise((resolve, reject) => {
    if (!isValidWriteResult(writeResult)) {
      return reject(new Error(JSON.stringify(writeResult.result)));
    }
    // TODO is it even possible for ops not to exist?
    resolve(writeResult.ops ? writeResult.ops[0] : null);
  });
}

function ensureId(fields) {
  if (!fields.id) {
    fields.id = new bson.ObjectId();
  } else {
    fields.id = new bson.ObjectId(String(fields.id));
  }
}

function addTimestamps(fields, options) {
  let now = new Date();
  if (options.create) {
    fields.createdAt = now;
  }
  fields.modifiedAt = now;
}

function removeMongoId(fields) {
  delete fields._id;
}

internals.odm = function(db) {

  function createModel(collectionName, baseSchema) {

    // TODO move me
    function validateBase(fields) {
      return Joi.validate(
        _.omit(fields, ['id', '_id', 'createdAt', 'modifiedAt']),
        baseSchema, {
          convert: false
        }
      ).error;
    }

    function Model(fields) {
      let err = validateBase(fields);

      if (err) {
        throw err;
      }

      ensureId(fields);
      removeMongoId(fields);

      this.fields = fields;
    };

    Model._collection = db.collection(collectionName);

    Model.all = (limit, skip) => {
      return new Promise((resolve, reject) => {

        if (!limit && !skip) {
          limit = Infinity;
        }

        if (!skip) {
          skip = 0;
        }

        let cursor = Model._collection.find({});

        if (skip) {
          cursor = cursor.skip(skip);
        }

        if (limit) {
          cursor = cursor.limit(limit);
        }

        cursor.toArray((err, raw) => {
          if (err) {
            return reject(err);
          }

          let mapped;
          try {
            mapped = raw.map((r) => {
              return new Model(r);
            });
          } catch (err) {
            return reject(err);
          }

          resolve(mapped);
        });
      });
    };

    Model.find = function(query) {
      if (!query || !_.isObject(query)) {
        return Promise.reject(new Error('You need to call find with a mongo query'));
      }

      return new Promise((resolve, reject) => {
        Model._collection.find(query).toArray((err, raw) => {
          if (err) {
            return reject(errors.mongo(err));
          }

          let models;
          try {
            models = raw.map((r) => {
              return new Model(r);
            });
          } catch (err) {
            return reject(err);
          }

          return resolve(models);
        });
      });
    };

    Model.findOne = function(query) {
      return Model._collection.findOne(query)
        .then((raw) => {
          if (!raw) {
            return null;
          }

          return new Model(raw);
        });
    };

    Model.findById = function(id) {
      if (!id) {
        Promise.reject(new Error('You need to call findById with an id'));
      }

      return new Promise((resolve) => {
          return resolve({
            id: new bson.ObjectId(String(id))
          });
        })
        .then(Model.findOne);
    };

    Model.prototype.save = function() {
      let self = this;

      return new Promise((resolve, reject) => {
        let err = validateBase(self.fields);

        if (err) {
          return reject(err);
        }

        addTimestamps(self.fields, {
          create: true
        });

        self.fields.id = new bson.ObjectId();

        Model._collection.save(self.fields)
          .then(extractResult)
          .then((result) => {
            self.fields = result;
            removeMongoId(self.fields);
            resolve(self);
          });
      });
    };

    Model.prototype.update = function(fields) {
      let self = this;

      return new Promise((resolve, reject) => {
        let newFields = _.assign({},
          self.fields,
          fields, {
            id: self.fields.id,
            createdAt: self.fields.createdAt
          }
        );

        let err = validateBase(newFields);

        if (err) {
          return reject(err);
        }

        if (!newFields.id) {
          err = new Error('Model does not have an id!');
          return reject(err);
        }

        ensureId(newFields);
        addTimestamps(newFields, {
          create: false
        });

        self.fields = newFields;

        Model._collection.updateOne({
          id: self.fields.id
        }, {
          $set: self.fields
        }, {
          upsert: false
        })
        .then(extractResult)
        .then(() => {
          removeMongoId(self.fields);
          return resolve(self);
        });
      });
    };

    Model.prototype.delete = function() {
      // TODO: Validate that id is in fields
      // TODO: Clean up model when done?
      return Model._collection.remove({
        id: this.fields.id
      });
    };

    Model.schema = baseSchema;
    return Model;
  }

  return {
    createModel: createModel
  };
};


exports.connect = (mongoStr) => {
  mongoStr = mongoStr || 'mongodb://localhost:27017/blog-service';

  return mongodb.MongoClient.connect(mongoStr)
    .then(internals.odm);
};
