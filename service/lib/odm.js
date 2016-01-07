'use strict';

const Joi = require('joi');
const _ = require('lodash');
const bson = require('bson');
const assert = require('assert');

function isValidWriteResult(writeResult) {
  return writeResult.result &&
    writeResult.result.ok &&
    (writeResult.ops && writeResult.ops.length) ||
    (writeResult.result.nModified > 0);
}

function extractResult(callback) {
  return (err, writeResult) => {
    if (err) {
      return callback(err);
    }

    if (!isValidWriteResult(writeResult)) {
      return callback(new Error(JSON.stringify(writeResult.result)));
    }

    callback(null, writeResult.ops ? writeResult.ops[0] : null);
  };
}

module.exports = function(db) {

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

  function createModel(collectionName, baseSchema) {

    function validateBase(fields) {
      return Joi.validate(
        _.omit(fields, ['id', '_id', 'createdAt', 'modifiedAt']),
        baseSchema, {
          convert: false
        }
      ).error;
    }

    let Model = function(fields) {
      let err = validateBase(fields);

      if (err) {
        throw err;
      }

      ensureId(fields);
      removeMongoId(fields);

      this.fields = fields;
    };

    Model._collection = db.collection(collectionName);

    Model.all = function(limit, skip, callback) {
      if (!callback) {
        if (typeof skip === 'function') {
          callback = skip;
          skip = 0;
        } else {
          callback = limit;
          limit = Infinity;
          skip = 0;
        }
      }

      let cursor = Model._collection.find({});

      if (skip) {
        cursor = cursor.skip(skip);
      }
      if (limit) {
        cursor = cursor.limit(limit);
      }

      cursor.toArray(function(err, raw) {
        if (err) {
          return callback(err);
        }

        let mapped;
        try {
          mapped = raw.map(function(r) {
            return new Model(r);
          });
        } catch (err) {
          return callback(err);
        }

        callback(null, mapped);
      });
    };

    Model.find = function(query, callback) {
      if (!callback) {
        throw new Error('You need to call find with a callback');
      }

      if (!query || !_.isObject(query)) {
        return setImmediate(function() {
          callback(new Error('You need to call find with a mongo query'));
        });
      }

      Model._collection.find(query).toArray(function(err, raw) {
        if (err) {
          return callback(errors.mongo(err));
        }

        let models;
        try {
          models = raw.map(function(r) {
            return new Model(r);
          });
        } catch (err) {
          return callback(err);
        }

        return callback(null, models);
      });
    };

    Model.findOne = function(query, callback) {
      Model._collection.findOne(query, function(err, raw) {
        if (err) {
          return callback(err);
        }

        if (!raw) {
          return callback(null, null);
        }

        let mapped;
        try {
          mapped = new Model(raw);
        } catch (err) {
          return callback(err);
        }

        callback(null, mapped);
      });
    };

    Model.findById = function(id, callback) {
      if (!id) {
        return setImmediate(function() {
          callback(new Error('You need to call findById with an id'));
        });
      }

      let oid;
      try {
        oid = new bson.ObjectId(String(id));
      } catch (err) {
        return setImmediate(function() {
          callback(err);
        });
      }

      Model.findOne({
        id: oid
      }, callback);
    };

    Model.prototype.save = function(callback) {
      let self = this;

      let err = validateBase(self.fields);

      if (err) {
        return setImmediate(function() {
          callback(err);
        });
      }

      addTimestamps(self.fields, {
        create: true
      });
      self.fields.id = new bson.ObjectId();

      Model._collection.save(self.fields, extractResult(function(err, result) {
        if (err) {
          return callback(err);
        }

        self.fields = result;
        removeMongoId(self.fields);

        callback(null, self);
      }));
    };

    Model.prototype.update = function(fields, callback) {
      let self = this;

      let newFields = _.assign({},
        self.fields,
        fields, {
          id: self.fields.id,
          createdAt: self.fields.createdAt
        }
      );

      let err = validateBase(newFields);

      if (err) {
        return setImmediate(function() {
          callback(err);
        });
      }

      if (!newFields.id) {
        err = errors.asBoom('Model does not have an id!');
        return setImmediate(function() {
          callback(err);
        });
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
      }, extractResult(function(err, result) {
        if (err) {
          return callback(err);
        }

        removeMongoId(self.fields);

        callback(null, self);
      }));
    };

    Model.prototype.delete = function(callback) {
      // TODO: Validate that id is in fields
      // TODO: Clean up model when done?
      Model._collection.remove({
        id: this.fields.id
      }, callback);
    };

    return Model;
  }

  return {
    createModel: createModel
  };
};

module.exports.Joi = Joi;
