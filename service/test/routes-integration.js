'use strict';

const chai = require('chai');
const should = chai.should();
chai.use(require('sinon-chai'));
//const sinon = require('sinon');
const _ = require('lodash');

const config = require('../lib/config');
const Odm = require('../lib/odm');
const createArticleModel = require('../lib/article');
const server = require('../lib/server');
const routes = require('../lib/routes');

describe('Integration: Routes', () => {
  function create(server) {
    return (payload) => {
      return new Promise(function(resolve, reject) {
        server.inject({
          url: '/articles',
          method: 'POST',
          payload: payload
        }, (res) => {
          if (res.statusCode !== 201) {
            return reject(new Error(`Expected a 201. Got ${res.statusCode} ${JSON.stringify(res.result.message)}`));
          }

          resolve(res.result);
        });
      });
    };
  }

  function get(server) {
    return (url) => {
      return new Promise(function(resolve, reject) {
        server.inject({
          url: url,
          method: 'GET'
        }, (res) => {
          if (res.statusCode !== 200) {
            return reject(new Error(`Expected a 200. Got ${res.statusCode} ${JSON.stringify(res.result.message)}`));
          }
          resolve(res.result);
        });
      });
    };
  }

  before((done) => {
    server.app.logger.level('error');

    Odm.connect(config.mongodb)
      .then(createArticleModel)
      .then(function(Article) {
        server.app.Article = Article;
        routes.forEach((r) => r(server));
      })
      .then(done)
      .catch(done);
  });

  after((done) => {
    server.app.logger.level('info');
    server.stop(done);
  });

  describe('Routes: Articles', function() {

    after((done) => {
      server.app.Article._collection.remove()
        .then(() => done())
        .catch(done);
    });

    let article = null;
    it('should POST an article', (done) => {
      let payload = {
        hed: 'foo',
        body: 'bar',
        tags: ['foo', 'bar'],
        uri: 'foo-baz'
      };

      Promise.resolve(payload)
        .then(create(server))
        .then((_article) => {
          article = _article;
          payload.hed.should.equal(article.hed);
          payload.body.should.equal(article.body);
          payload.tags.should.deep.equal(article.tags);
          done();
        })
        .catch(done);
    });

    it('should fail to POST an article with a duplicate uri', (done) => {
      let payload = {
        hed: 'foo',
        body: 'bar',
        tags: ['foo', 'bar'],
        uri: 'foo-baz'
      };

      Promise.resolve(payload)
        .then(create(server))
        .then(() => done(new Error('should not get here.')))
        .catch((err) => {
          should.exist(err);
          err.message.should.match(/409/);
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
      Promise.resolve(`/articles/${article.id}`)
        .then(get(server))
        .then((found) => {
          String(article.id).should.equal(String(found.id));
          done();
        })
        .catch(done);
    });

    it('should find a published article by uri', (done) => {
      Promise.resolve(`/articles/published?uri=${article.uri}`)
        .then(get(server))
        .then((found) => {
          String(article.id).should.equal(String(found.id));
          done();
        })
        .catch(done);
    });

    it('should find a published article by id', (done) => {
      Promise.resolve(`/articles/published?id=${article.id.toString()}`)
        .then(get(server))
        .then((found) => {
          String(article.id).should.equal(String(found.id));
          done();
        })
        .catch(done);
    });

    let article2;

    it('should find all articles', (done) => {

      let knownArticles = [article];

      const payload = {
        hed: 'foo',
        body: 'bar',
        tags: ['foo']
      };

      Promise.resolve(payload)
        .then(create(server))
        .then((_article) => {
          article2 = _article;
          knownArticles.unshift(article2);
          return Promise.resolve(`/articles`).then(get(server));
        })
        .then((result) => {
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
        })
        .catch(done);
    });

    it('should find articles with specifed tags with multi docs have the same tag', function(done) {
      const knownArticles = [article2, article];
      const tag = 'foo';

      Promise.resolve(`/articles?tags=${tag}`)
        .then(get(server))
        .then((result) => {
          let articles = result.data;

          knownArticles.length.should.equal(articles.length);
          articles.forEach((a, i) => {
            String(knownArticles[i].id).should.equal(String(a.id));
          });
          done();
        })
        .catch(done);
    });

    it('should find articles with specifed tags with multi docs have different tags', function(done) {
      const knownArticles = [article];
      const tag = 'bar';

      Promise.resolve(`/articles?tags=${tag}`)
        .then(get(server))
        .then((result) => {
          let articles = result.data;

          knownArticles.length.should.equal(articles.length);
          articles.forEach((a, i) => {
            String(knownArticles[i].id).should.equal(String(a.id));
          });
          done();
        })
        .catch(done);
    });

    it('should find all published articles', (done) => {

      let knownArticles = [article];

      Promise.resolve('/articles/published/latest')
        .then(get(server))
        .then((result) => {
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
        })
        .catch(done);
    });

    it('should find published articles with specifed tags', function(done) {
      const knownArticles = [article];
      const tag = 'foo';

      Promise.resolve(`/articles/published/latest?tags=${tag}`)
        .then(get(server))
        .then((result) => {
          const articles = result.data;

          knownArticles.length.should.equal(articles.length);

          articles.forEach((a, i) => {
            String(knownArticles[i].id).should.equal(String(a.id));
          });
          done();
        })
        .catch(done);
    });
  });

  describe('Routes: Tags', function() {
    after((done) => {
      server.app.Article._collection.remove()
        .then(() => done())
        .catch(done);
    });

    let payloads;

    before((done) => {
      this.timeout(3e3);

      payloads = [{
        hed: 'foo',
        body: 'bar',
        tags: ['foo', 'bar']
      }, {
        hed: 'foo',
        body: 'bar',
        tags: ['foo', 'bar']
      }, {
        hed: 'foo',
        body: 'bar',
        tags: ['baz']
      }];

      for (var i = 0; i < 100; i++) {
        payloads.push(_.cloneDeep(payloads[0]));
      }

      Promise.all(payloads.map(create(server)))
        .then((articles) => {

          articles.forEach((a) => {
            a.tags.should.be.an.array;
            a.tags.length.should.be.above(0);
          });

          done();
        })
        .catch(done);
    });

    it('should return all tags', function(done) {
      Promise.resolve('/tags')
        .then(get(server))
        .then((result) => {
          result.page.should.equal(1);
          result.total.should.equal(payloads.length);

          const validTags = ['foo', 'bar', 'baz'].sort();
          const tags = result.data.sort();

          tags.should.deep.equal(validTags);
          done();
        })
        .catch(done);
    });
  });
});
