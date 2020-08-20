import { resolve } from 'path';

module.exports = {
    test: {
        client: 'sqlite3',
        connection: ':memory:',
        useNullAsDefault: true,
        migrations: {
            directory: resolve(__dirname, './database/migrations'),
        },
        seeds: {
            directory: resolve(__dirname, './database/seeds'),
        },
    },
    development: {
        // client: 'postgresql',
        // connection: process.env.DB_CONNECTION_STRING
        client: 'sqlite3',
        connection: {
            filename: resolve(__dirname, './database/db.db3'),
        },
        useNullAsDefault: true,
        migrations: {
            directory: resolve(__dirname, './database/migrations'),
            tableName: 'migrations',
            extension: 'ts',
        },
        seeds: { directory: resolve(__dirname, './database/seeds'), extension: 'ts' },
    },
    staging: {
        client: 'postgresql',
        connection: {
            database: '',
            user: '',
            password: '',
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: 'knex_migrations',
        },
    },
    production: {
        client: 'postgresql',
        connection: {
            database: '',
            user: '',
            password: '',
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: 'knex_migrations',
        },
    },
};
