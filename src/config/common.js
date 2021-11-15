'use strict';

const dotenv = require('dotenv');
dotenv.config();

const config = {
  env: process.env.NODE_ENV,
  port: process.env.USE_PORT,
  db : process.env.DB_CONNECTION,
};

module.exports = config;
