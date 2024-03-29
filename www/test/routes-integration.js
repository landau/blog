'use strict';

const chai = require('chai');
chai.should();
const nock = require('nock');
const slug = require('slug');

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
      const articles = [fixtures.article, fixtures.publishedArticle];

      const response = {
        total: articles.length,
        page: 1,
        data: articles
      };

      nock(server.app.config.serviceurl)
        .get('/articles/published/latest')
        .query({
          limit: server.app.config.pagination.index
        })
        .reply(200, response);

      const tagsResponse = {
        page: 1,
        total: 2,
        data: ['a', 'b']
      };

      nock(server.app.config.serviceurl)
        .get('/tags')
        .query({
          published: true
        })
        .reply(200, tagsResponse);

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
      const articles = [fixtures.article, fixtures.publishedArticle];

      const response = {
        total: articles.length,
        page: 2,
        data: articles
      };

      nock(server.app.config.serviceurl)
        .get('/articles/published/latest')
        .query({
          skip: server.app.config.pagination.index,
          limit: server.app.config.pagination.index
        })
        .reply(200, response);

      const tagsResponse = {
        page: 1,
        total: 2,
        data: ['a', 'b']
      };

      nock(server.app.config.serviceurl)
        .get('/tags')
        .query({
          published: true
        })
        .reply(200, tagsResponse);

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

  // FIXME: Why won't this pass?
  describe.skip('GET /tags/{tag}', () => {
    it('should reply with html', (done) => {
      const articles = [fixtures.article, fixtures.publishedArticle];
      const tags = 'a,b,c';

      const response = {
        total: articles.length,
        page: 1,
        data: articles
      };

      nock(server.app.config.serviceurl)
        .get('/articles/published/latest')
        .query({
          limit: 4,
          tags: tags
        })
        .reply(200, response);

      const tagsResponse = {
        page: 1,
        total: 2,
        data: ['a', 'b']
      };

      nock(server.app.config.serviceurl)
        .get('/tags')
        .query({
          published: true
        })
        .reply(200, tagsResponse);

      server.inject({
        url: `/tags/${tags}`
      }, (res) => {
        if (res.statusCode !== 200) {
          return done(new Error(`Expected a 200. Got ${res.statusCode} ${JSON.stringify(res.result.message)}`));
        }
        res.result.should.be.a.string;
        done();
      });
    });
  });

  describe('GET /admin', () => {
    it('should reply with html', (done) => {
      const articles = [fixtures.article, fixtures.publishedArticle];

      const response = {
        total: articles.length,
        page: 1,
        data: articles
      };

      nock(server.app.config.serviceurl)
        .get('/articles')
        .query({
          limit: server.app.config.pagination.index
        })
        .reply(200, response);

      const tagsResponse = {
        page: 1,
        total: 2,
        data: ['a', 'b']
      };

      nock(server.app.config.serviceurl)
        .get('/tags')
        .query({
          published: false
        })
        .reply(200, tagsResponse);

      server.inject({
        url: '/admin'
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

  describe('POST /admin/post', () => {
    it('should POST a new article', (done) => {
      const payload = {
        hed: 'hi',
        body: 'yo',
        tags: 'a,b,c',
        uri: 'foo to the bar'
      };

      const nockPayload = {
        hed: 'hi',
        body: 'yo',
        tags: ['a', 'b', 'c'],
        uri: slug(payload.uri)
      };

      nock(server.app.config.serviceurl)
        .post('/articles', nockPayload)
        .reply(201, fixtures.article);

      server.inject({
        url: `/admin/post`,
        method: 'POST',
        payload: payload
      }, (res) => {

        if (res.statusCode !== 201) {
          return done(new Error(`Expected a 201. Got ${res.statusCode} ${JSON.stringify(res.result.message)}`));
        }

        res.result.should.be.a.string;

        done();
      });
    });
  });

  describe('PUT /admin/post', () => {
    it('should update an existing article', (done) => {
      let payload = fixtures.article;

      nock(server.app.config.serviceurl)
        .put(`/articles/${payload.id}`, payload)
        .reply(200, fixtures.article);

      server.inject({
        url: `/admin/post/${payload.id}`,
        method: 'POST',
        payload: payload
      }, (res) => {
        if (res.statusCode !== 201) {
          return done(new Error(`Expected a 201. Got ${res.statusCode} ${JSON.stringify(res.result.message)}`));
        }

        res.result.should.be.a.string;
        done();
      });
    });
  });

  describe('error page', function() {
    it('should reply with html', (done) => {
      nock(server.app.config.serviceurl)
        .get(`/articles/published?uri=${fixtures.publishedArticle.uri}`)
        .reply(404, { message: 'Not Found' });

      server.inject({
        url: `/post/${fixtures.publishedArticle.uri}`
      }, (res) => {
        if (res.statusCode !== 404) {
          return done(new Error(`Expected a 404. Got ${res.statusCode} ${JSON.stringify(res.result.message)}`));
        }
        res.result.should.be.a.string;
        /404/.test(res.result).should.be.true; // Contains text indicating the status code
        done();
      });
    });
  });
});
