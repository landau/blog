'use strict';
/*jshint expr: true */

const chai = require('chai');
const should = chai.Should();
const sinon = require('sinon');
chai.use(require('sinon-chai'));

const mongodb = require('mongodb');

const albatross = require('../lib/odm');
const Joi = albatross.Joi;

const MONGO_CONNSTRING = process.env.NODE_MONGODB || 'mongodb://localhost/odm-test';

describe('albatross', () => {

  let odm, db, Model, myModel, myModel2;

  before((done) => {
    mongodb.MongoClient.connect(MONGO_CONNSTRING, (err, _db) => {
      if (err) {
        return done(err);
      }

      db = _db;

      try {
        odm = albatross(db);
        Model = odm.createModel('albatross_test', {
          someStringProperty: Joi.string(),
          someNumberProperty: Joi.number().integer()
        });
      } catch (err) {
        return done(err);
      }

      done();
    });
  });

  it('should generate well-formed models', () => {
    Model.should.have.property('_collection');
    Model.should.have.property('all');
    Model.should.have.property('findById');
  });

  it('should create a new model instance', () => {
    myModel = new Model({
      _id: mongodb.ObjectId(),
      someStringProperty: 'foo',
      someNumberProperty: 12
    });

    myModel.should.have.property('fields');
    myModel.fields.should.have.property('someStringProperty');
    myModel.fields.should.have.property('someNumberProperty');
    myModel.fields.should.have.property('id');
    myModel.fields.should.not.have.property('_id');

    myModel.should.have.property('save');
    myModel.should.have.property('update');
    myModel.should.have.property('delete');
  });

  it('should not create a new model on invalid inputs', () => {
    let thisModelShouldBreak;
    should.throw(() => {
      thisModelShouldBreak = new Model({
        someGarbageProperty: 'pony',
        someStringProperty: 0xdeadbeef
      });
    });
  });

  it('should save a model instance', (done) => {
    myModel.save((err, myModel) => {
      if (err) {
        return done(err);
      }

      myModel.should.have.property('fields');
      myModel.fields.should.have.property('someStringProperty');
      myModel.fields.should.have.property('someNumberProperty');
      myModel.fields.should.have.property('id');
      myModel.fields.should.have.property('createdAt');
      myModel.fields.should.have.property('modifiedAt');

      done();
    });
  });

  it('should update a model instance', (done) => {
    myModel.update({ someStringProperty: 'pony' }, (err, _model) => {
      if (err) {
        return done(err);
      }

      myModel = _model;

      myModel.should.have.property('fields');
      myModel.fields.should.have.property('someStringProperty');
      myModel.fields.someStringProperty.should.equal('pony');
      myModel.fields.should.have.property('someNumberProperty');
      myModel.fields.should.have.property('createdAt');
      myModel.fields.should.have.property('modifiedAt');

      done();
    });
  });

  it('should findOne by a query', (done) => {
    let query = {
      someStringProperty: myModel.fields.someStringProperty
    };

    Model.findOne(query, (err, _model) => {
      if (err) {
        return done(err);
      }

      should.not.equal(_model, null);

      _model.should.have.property('fields');
      _model.fields.should.have.property('someStringProperty');
      _model.fields.someStringProperty.should.equal(myModel.fields.someStringProperty);
      _model.fields.should.have.property('someNumberProperty');
      _model.fields.someNumberProperty.should.equal(myModel.fields.someNumberProperty);
      _model.fields.should.have.property('createdAt');
      _model.fields.should.have.property('modifiedAt');

      done();
    });
  });

  it('should find by id', (done) => {
    Model.findById(mongodb.ObjectId(myModel.fields.id), (err, _model) => {
      if (err) {
        return done(err);
      }

      should.not.equal(_model, null);

      _model.should.have.property('fields');
      _model.fields.should.have.property('someStringProperty');
      _model.fields.someStringProperty.should.equal(myModel.fields.someStringProperty);
      _model.fields.should.have.property('someNumberProperty');
      _model.fields.someNumberProperty.should.equal(myModel.fields.someNumberProperty);
      _model.fields.should.have.property('createdAt');
      _model.fields.should.have.property('modifiedAt');

      done();
    });
  });

  it('should find all instances', (done) => {
    myModel2 = new Model({
      _id: mongodb.ObjectId(),
      someStringProperty: 'bar',
      someNumberProperty: 12
    });

    myModel2.save((err, model) => {
      if (err) {
        return done(err);
      }

      myModel2 = model;

      Model.all((err, models) => {
        if (err) {
          return done(err);
        }

        models.should.be.an('array');
        models.should.have.length(2);

        let _model = models.shift();
        _model.should.have.property('fields');
        _model.fields.should.have.property('someStringProperty');
        _model.fields.someStringProperty.should.equal(myModel.fields.someStringProperty);
        _model.fields.should.have.property('someNumberProperty');
        _model.fields.someNumberProperty.should.equal(myModel.fields.someNumberProperty);
        _model.fields.should.have.property('createdAt');
        _model.fields.should.have.property('modifiedAt');

        done();
      });
    });
  });

  it('should execute a find query', (done) => {
    let query = {
      someStringProperty: myModel.fields.someStringProperty
    };

    Model.find(query, (err, models) => {
      if (err) {
        return done(err);
      }

      models.should.be.an.array;
      models.length.should.equal(1);

      models.forEach((model) => {
        should.exist(model);

        model.should.have.property('fields');
        model.fields.should.have.property('someStringProperty');
        model.fields.someStringProperty.should.equal(myModel.fields.someStringProperty);
        model.fields.should.have.property('someNumberProperty');
        model.fields.someNumberProperty.should.equal(myModel.fields.someNumberProperty);
        model.fields.should.have.property('createdAt');
        model.fields.should.have.property('modifiedAt');
      });

      done();
    });
  });

  it('should remove an instance', (done) => {
    myModel.delete((err) => {
      if (err) {
        return done(err);
      }

      myModel2.delete((err) => {
        if (err) {
          return done(err);
        }

        Model.all((err, models) => {
          if (err) {
            return done(err);
          }

          models.should.be.an('array');
          models.should.have.length(0);

          done();
        });
      });
    });
  });

  after((done) => {
    db.dropDatabase(done);
  });
});
