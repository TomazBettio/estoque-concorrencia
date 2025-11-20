const knex = require('knex');
const configuration = require('../../knexfile.js');

// Pega a config de 'development' (ou usa variável de ambiente para decidir)
const config = configuration.development;

const connection = knex(config);

module.exports = connection;