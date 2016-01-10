'use strict';

const chai = require('chai');
chai.should();
const nock = require('nock');

const app = require('../lib');

const fixtures = require('./fixtures');

describe('Integration: Routes', () => {
  let server;
  before((done) => {
    app()
      .then((s) => server = s)
      .then(() => server.app.logger.level('none'))
      .then(done.bind(null, null))
      .catch(done);
  });

  after(() => server.app.logger.level('info'));

  describe('/ping', () => {
    it('should respond with a 200', (done) => {
      server.inject({
        url: '/ping'
      }, (res) => {
        if (res.statusCode !== 200) {
          return done(new Error(`Expected a 200. Got ${res.statusCode} ${JSON.stringify(res.result.message)}`));
        }
        done();
      });
    });
  });

  describe('index', () => {
    it('should reply with html', (done) => {
      nock(server.app.config.serviceurl)
        .get('/articles')
        .reply(200, [fixtures.article, fixtures.publishedArticle]);

      server.inject({
        url: '/'
      }, (res) => {
        if (res.statusCode !== 200) {
          return done(new Error(`Expected a 200. Got ${res.statusCode} ${JSON.stringify(res.result.message)}`));
        }
        res.result.should.be.a.string;
        done();
      });
    });
  });

  describe('/post', () => {
    it('should reply with html', (done) => {
      nock(server.app.config.serviceurl)
        .get('/articles')
        .reply(200, [fixtures.article, fixtures.publishedArticle]);

      server.inject({
        url: '/'
      }, (res) => {
        if (res.statusCode !== 200) {
          return done(new Error(`Expected a 200. Got ${res.statusCode} ${JSON.stringify(res.result.message)}`));
        }
        res.result.should.be.a.string;
        done();
      });
    });
  });
});
