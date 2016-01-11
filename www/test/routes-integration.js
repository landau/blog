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
      .then(() => server.app.logger.level('error'))
      .then(done.bind(null, null))
      .catch(done);
  });

  after(() => server.app.logger.level('info'));

  describe('GET /ping', () => {
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

  describe('GET index', () => {
    it('should reply with html', (done) => {
      nock(server.app.config.serviceurl)
        .get('/articles/published/latest')
        .query({
          limit: 4
        })
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

    it('should reply with html on page 2', (done) => {
      nock(server.app.config.serviceurl)
        .get('/articles/published/latest')
        .query({
          skip: 1,
          limit: 4
        })
        .reply(200, [fixtures.article, fixtures.publishedArticle]);

      server.inject({
        url: '/?page=2'
      }, (res) => {
        if (res.statusCode !== 200) {
          return done(new Error(`Expected a 200. Got ${res.statusCode} ${JSON.stringify(res.result.message)}`));
        }
        res.result.should.be.a.string;
        done();
      });
    });
  });

  describe('GET /post/{uri}', () => {
    it('should reply with html', (done) => {
      nock(server.app.config.serviceurl)
        .get(`/articles/published?uri=${fixtures.publishedArticle.uri}`)
        .reply(200, fixtures.publishedArticle);

      server.inject({
        url: `/post/${fixtures.publishedArticle.uri}`
      }, (res) => {
        if (res.statusCode !== 200) {
          return done(new Error(`Expected a 200. Got ${res.statusCode} ${JSON.stringify(res.result.message)}`));
        }
        res.result.should.be.a.string;
        done();
      });
    });
  });

  describe('GET /admin/post', () => {
    it('should reply with html', (done) => {
      server.inject({
        url: `/admin/post`
      }, (res) => {
        if (res.statusCode !== 200) {
          return done(new Error(`Expected a 200. Got ${res.statusCode} ${JSON.stringify(res.result.message)}`));
        }
        res.result.should.be.a.string;
        done();
      });
    });
  });

  describe('GET /admin/post/{id}', () => {
    it('should reply with html', (done) => {
      nock(server.app.config.serviceurl)
        .get(`/articles/${fixtures.publishedArticle.id}`)
        .reply(200, fixtures.publishedArticle);

      server.inject({
        url: `/admin/post/${fixtures.publishedArticle.id}`
      }, (res) => {
        if (res.statusCode !== 200) {
          return done(new Error(`Expected a 200. Got ${res.statusCode} ${JSON.stringify(res.result.message)}`));
        }
        res.result.should.be.a.string;
        done();
      });
    });
  });

  // FIXME: handle redirect
  describe.skip('POST /admin/post', () => {
    it('should POST a new article', (done) => {
      const payload = {
        hed: 'hi',
        body: 'yo'
      };

      nock(server.app.config.serviceurl)
        .post('/articles', payload)
        .reply(201, fixtures.article);

      server.inject({
        url: `/admin/post`,
        method: 'POST',
        payload: payload
      }, (res) => {
        if (res.statusCode !== 200) {
          return done(new Error(`Expected a 200. Got ${res.statusCode} ${JSON.stringify(res.result.message)}`));
        }
        res.result.should.be.a.string;
        done();
      });
    });
  });

  describe.skip('PUT /admin/post', () => {
    it('should update an existing article', (done) => {
      const payload = fixtures.article;

      nock(server.app.config.serviceurl)
        .put(`/articles/${payload.id}`, payload)
        .reply(200, fixtures.article);

      server.inject({
        url: `/admin/post/${payload.id}`,
        method: 'POST',
        payload: payload
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
