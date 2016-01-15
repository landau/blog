'use strict';

const chai = require('chai');
//const should = chai.should();
chai.use(require('sinon-chai'));
//const sinon = require('sinon');

const config = require('../../lib/config');
const Odm = require('../../lib/odm');
const createArticleModel = require('../../lib/article');
const server = require('../../lib/server');
const routes = require('../../lib/routes/article');

describe('Integration: Article Routes', () => {
  before((done) => {
    server.app.logger.level('error');

    Odm.connect(config.mongodb)
      .then(createArticleModel)
      .then(function(Article) {
        server.app.Article = Article;
        routes(server);
      })
      .then(done)
      .catch(done);
  });

  after((done) => {
    server.app.logger.level('info');
    server.app.Article._collection.remove({}, done);
  });

  let article = null;
  it('should POST an article', (done) => {
    let payload = {
      hed: 'foo',
      body: 'bar'
    };

    server.inject({
      url: '/articles',
      method: 'POST',
      payload: payload
    }, (res) => {
      if (res.statusCode !== 201) {
        return done(new Error(`Expected a 201. Got ${res.statusCode} ${JSON.stringify(res.result.message)}`));
      }

      article = res.result;
      payload.hed.should.equal(article.hed);
      payload.body.should.equal(payload.body);

      done();
    });
  });

  it('should update an article', (done) => {
    let payload = {
      hed: 'baz',
      body: article.body,
      published: true,
      uri: 'fishing-by-the-wayside'
    };

    server.inject({
      url: `/articles/${article.id}`,
      method: 'PUT',
      payload: payload
    }, (res) => {
      if (res.statusCode !== 200) {
        return done(new Error(`Expected a 200. Got ${res.statusCode} ${JSON.stringify(res.result.message)}`));
      }

      let update = res.result;
      payload.hed.should.equal(update.hed);
      article.body.should.equal(update.body);
      payload.published.should.be.true;
      payload.uri.should.equal(update.uri);

      article = update;

      done();
    });
  });

  it('should find an article by id', (done) => {
    server.inject({
      url: `/articles/${article.id}`,
      method: 'GET'
    }, (res) => {
      if (res.statusCode !== 200) {
        return done(new Error(`Expected a 200. Got ${res.statusCode} ${JSON.stringify(res.result.message)}`));
      }

      let found = res.result;
      String(article.id).should.equal(String(found.id));

      done();
    });
  });

  it('should find a published article by uri', (done) => {
    server.inject({
      url: `/articles/published?uri=${article.uri}`,
      method: 'GET'
    }, (res) => {
      if (res.statusCode !== 200) {
        return done(new Error(`Expected a 200. Got ${res.statusCode} ${JSON.stringify(res.result.message)}`));
      }

      let found = res.result;
      String(article.id).should.equal(String(found.id));

      done();
    });
  });

  it('should find a published article by id', (done) => {
    server.inject({
      url: `/articles/published?id=${article.id.toString()}`,
      method: 'GET'
    }, (res) => {
      if (res.statusCode !== 200) {
        return done(new Error(`Expected a 200. Got ${res.statusCode} ${JSON.stringify(res.result.message)}`));
      }

      let found = res.result;
      String(article.id).should.equal(String(found.id));

      done();
    });
  });

  it('should find all articles', (done) => {

    let knownArticles = [article];

    server.inject({
      url: '/articles',
      method: 'POST',
      payload: {
        hed: 'foo',
        body: 'bar'
      }
    }, (res) => {
      if (res.statusCode !== 201) {
        return done(new Error(`Expected a 201. Got ${res.statusCode} ${JSON.stringify(res.result.message)}`));
      }

      knownArticles.unshift(res.result);

      server.inject({
        url: '/articles',
        method: 'GET'
      }, (res) => {
        if (res.statusCode !== 200) {
          return done(new Error(`Expected a 200. Got ${res.statusCode} ${JSON.stringify(res.result.message)}`));
        }

        let result = res.result;
        result.should.be.an.object;

        result.page.should.equal(1);
        result.total.should.equal(knownArticles.length);

        let articles = result.data;
        articles.should.be.an.array;

        knownArticles.length.should.equal(articles.length);
        articles.forEach((a, i) => {
          String(knownArticles[i].id).should.equal(String(a.id));
        });
        done();
      });
    });
  });

  it('should find all published articles', (done) => {

    let knownArticles = [article];

    server.inject({
      url: '/articles/published/latest',
      method: 'get'
    }, (res) => {
      if (res.statusCode !== 200) {
        return done(new Error(`Expected a 200. Got ${res.statusCode} ${JSON.stringify(res.result.message)}`));
      }

      let result = res.result;
      result.should.be.an.object;

      result.page.should.equal(1);
      result.total.should.equal(knownArticles.length);

      let articles = result.data;
      articles.should.be.an.array;

      knownArticles.length.should.equal(articles.length);
      articles.forEach((a, i) => {
        String(knownArticles[i].id).should.equal(String(a.id));
      });
      done();

    });
  });
});
