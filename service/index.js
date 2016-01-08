'use strict';

const app = module.exports = require('./lib/index');
const logger = require('./lib/logging').logger;

if (require.main === module) {

  logger.info('Initializing...');

  let _server = null;

  app().then((server) => {
      _server = server;

      server.start((err) => {
        if (err) {
          _server.app.log.error(err);
          throw err;
        }

        _server.app.logger.info(`Server started on ${server.info.uri}`);
      });
    })
    .catch(require('assert'));
}
