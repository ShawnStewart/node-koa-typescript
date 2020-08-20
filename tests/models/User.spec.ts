import mockDb from 'mock-knex';

import db from '../../src/database/dbConfig';
import User from '../../src/models/User';

const queryTracker = mockDb.getTracker();

describe('Test User model', () => {
    beforeAll((done) => {
        mockDb.mock(db);
        done();
    });

    beforeEach((done) => {
        queryTracker.install();
        done();
    });

    afterEach((done) => {
        queryTracker.uninstall();
        done();
    });

    afterAll((done) => {
        mockDb.unmock(db);
        done();
    });

    describe('create', () => {
        const newUser = { username: 'shawn', password: 'password', email: 'shawn@gmail.com' };

        test('inserts new user', async (done) => {
            queryTracker.on('query', (query) => {
                expect(query.method).toEqual('insert');
                expect(query.sql).toEqual('insert into `users` (`email`, `password`, `username`) values (?, ?, ?)');
                expect(query.bindings[0]).toEqual('shawn@gmail.com');
                expect(query.bindings[1]).toEqual('password');
                expect(query.bindings[2]).toEqual('shawn');
                query.response([newUser]);
            });

            expect(await User.create(newUser)).toEqual(newUser);
            done();
        });
    });

    describe('getAll', () => {
        const seed = [{ id: 123, email: null, username: 'shawn', password: 'password', isDeleted: false }];

        test('defaults to limit 100', async (done) => {
            queryTracker.on('query', (query) => {
                expect(query.method).toEqual('select');
                expect(query.sql).toEqual(
                    'select `id`, `username`, `email`, `createdAt`, `updatedAt`, `deletedAt`, `isDeleted` from `users` limit ?',
                );
                expect(query.bindings[0]).toEqual(100);
                query.response(seed);
            });

            expect(await User.getAll()).toEqual(seed);
            done();
        });

        test('uses limit passed', async (done) => {
            queryTracker.on('query', (query) => {
                expect(query.method).toEqual('select');
                expect(query.sql).toEqual(
                    'select `id`, `username`, `email`, `createdAt`, `updatedAt`, `deletedAt`, `isDeleted` from `users` limit ?',
                );
                expect(query.bindings[0]).toEqual(25);
                query.response(seed);
            });

            expect(await User.getAll(25)).toEqual(seed);
            done();
        });
    });

    describe('findById', () => {
        test('queries for user by id', async (done) => {
            const seed = { id: 123, email: null, username: 'shawn', password: 'password', isDeleted: false };

            queryTracker.on('query', (query) => {
                expect(query.method).toEqual('first');
                expect(query.sql).toEqual('select * from `users` where `id` = ? limit ?');
                expect(query.bindings[0]).toEqual(123);
                expect(query.bindings[1]).toEqual(1);
                query.response(seed);
            });

            expect(await User.findById(123)).toEqual(seed);
            done();
        });
    });

    describe('findByUsername', () => {
        test('queries for user by username', async (done) => {
            const seed = { id: 123, email: null, username: 'shawn', password: 'password', isDeleted: false };

            queryTracker.on('query', (query) => {
                expect(query.method).toEqual('first');
                expect(query.sql).toEqual('select * from `users` where `username` = ? limit ?');
                expect(query.bindings[0]).toEqual('shawn');
                expect(query.bindings[1]).toEqual(1);
                query.response(seed);
            });

            expect(await User.findByUsername('shawn')).toEqual(seed);
            done();
        });
    });
});
