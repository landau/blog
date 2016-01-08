'use strict';

const config = require('./config');

const logger = exports.logger = require('bunyan').createLogger({
  name: config.name
});

exports.attach = (server) => {

  function getLogline(request) {
    var logLine = {
      id: request.id,
      url: request.raw.req.url.toString(),
      statusCode: request.raw.res.statusCode,
      method: request.raw.req.method,
      env: process.env.NODE_ENV || 'development',
      userAgent: request.headers['user-agent'],
      requestIp: request.info.remoteAddress,
      referrer: request.info.referrer,
      handlerExecutionTime: request.info.responded - request.info.received
    };

    if (request.payload) {
      logLine.payload = request.payload;
    }

    return logLine;
  }

  server.on('response', (request) => {
    // Mute request to /ping
    if (request.route.settings.tags && request.route.settings.tags[0] === 'healthcheck') {
      return;
    }

    logger.info(getLogline(request));
  });

  server.on('request-error', (request, error) => {
    var logLine = getLogline(request);
    logLine.stack = error.stack;
    logger.error(logLine);
  });

};
