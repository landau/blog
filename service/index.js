'use strict';

const app = module.exports = require('./lib/index');
const logger = require('./lib/logging').logger;

if (require.main === module) {

  logger.info('Initializing...');

  let _server = null;

  app().then((server) => {
      _server = server;

      // TODO why isn't this working as a promise?
      server.start((err) => {
        if (err) {
          _server.app.logger.error(err);
          throw err;
        }

        _server.app.logger.info(`Server started on ${server.info.uri}`);
      });
    })
    .catch(require('assert').ifError);
}
