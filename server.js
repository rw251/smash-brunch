const server = require('./brunch-server.js');
const config = require('./server/config');
const pino = require('pino')();

server(config.server.port || 3333, 'dist', () => {
  pino.info(`Server listening on ${config.server.port || 3333}`);
});

pino.info('Attempting to start the server...');
