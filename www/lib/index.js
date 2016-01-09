'use strict';

const server = module.exports = require('./server');
const routes = require('./routes');

module.exports = () => {
  return Promise.resolve(server).then(routes);
};
