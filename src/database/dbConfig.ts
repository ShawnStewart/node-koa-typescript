import knex from 'knex';
const config = require('../knexfile');

const env = process.env.NODE_ENV || 'development';

export default knex(config[env]);
