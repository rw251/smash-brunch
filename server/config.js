const dotenv = require('dotenv');
const pino = require('pino')();

dotenv.load({ path: '.env' });

const mustExist = function mustExist(name) {
  if (!process.env[name]) {
    pino.fatal(`${name} is not defined but is mandatory.`);
    pino.info('Exiting...');
    return process.exit(1);
  }
  return process.env[name];
};

const ENV = {
  // mongo url
  MONGO_URL: mustExist('MONGODB_URI'),

  // passport secret for expressjs authentication
  PASSPORT_SECRET: mustExist('PASSPORT_SECRET'),

  // server details
  SERVER_PORT: process.env.SERVER_PORT,
  // SERVER_URL: mustExist('SERVER_URL'),

  SENDGRID_USERNAME: mustExist('SENDGRID_USERNAME'),
  SENDGRID_PASSWORD: mustExist('SENDGRID_PASSWORD'),
};

module.exports = {
  mongoUrl: ENV.MONGO_URL,
  // user auth
  passport: {
    secret: ENV.PASSPORT_SECRET,
  },
  server: {
    port: ENV.SERVER_PORT,
  },
  email: {
    username: ENV.SENDGRID_USERNAME,
    password: ENV.SENDGRID_PASSWORD,
  },
  mode: process.env.MODE || 'development',
};
