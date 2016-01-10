'use strict';

const chai = require('chai');
chai.should();
const nock = require('nock');

const app = require('../lib');

const fixtures = require('./fixtures');

describe('Integration: Routes', function() {
  let server;
  before((done) => {
    app()
      .then((s) => server = s)
      .then(() => server.app.logger.level('none'))
      .then(done.bind(null, null))
      .catch(done);
  });

  after(() => server.app.logger.level('info'));

  describe('index', function() {
    it('should reply with html', function(done) {
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
