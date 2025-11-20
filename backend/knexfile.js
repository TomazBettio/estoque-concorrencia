require('dotenv').config();
const path = require('path');

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    searchPath: ['knex', 'public'],
    pool: {
      min: 2,
      max: 10
    },

    migrations: {
      tableName: 'knex_migrations',
      directory: path.resolve(__dirname, 'src', 'database', 'migrations')
    },
    seeds: {
      directory: path.resolve(__dirname, 'src', 'database', 'seeds')
    },
    // ----------------------------
    ssl: { rejectUnauthorized: false }
  }
};