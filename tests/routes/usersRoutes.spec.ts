import bcrypt from 'bcryptjs';
import { Server } from 'http';
import request from 'supertest';

import app from '../../src/app';
import User, { userValidator } from '../../src/models/User';
import * as authUtils from '../../src/utils/auth';

describe('User routes', () => {
    const ENV = process.env;
    const TEST_SECRET = 'this is a test secret';
    let server: Server;

    beforeAll((done) => {
        server = app.listen();
        done();
    });

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...ENV };
    });

    afterEach(() => {
        process.env = ENV;
    });

    afterAll((done) => {
        server.close();
        done();
    });

    test(`'/api/v1/users', returns a list of users`, async (done) => {
        const expectedUsers = [
            {
                username: 'shawn',
                password: 'password',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isDeleted: false,
            },
        ];
        const mockGetAllUsers = jest.spyOn(User, 'getAll').mockImplementation(() => Promise.resolve(expectedUsers));
        process.env.API_SECRET_KEY = TEST_SECRET;
        const token = authUtils.createAuthToken({ test: true });

        return request(server)
            .get('/api/v1/users')
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .expect((res) => {
                expect(mockGetAllUsers).toHaveBeenCalled();
                expect(res.body).toEqual(expect.objectContaining({ users: expectedUsers }));
                done();
            });
    });

    test(`'/api/v1/users/register', creates a new users`, async (done) => {
        const mockCreatedUser = {
            username: 'shawn',
            password: 'mockHashedPassword',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isDeleted: false,
        };
        const requestBody = { username: 'shawn', password: 'password', email: 'shawn@gmail.com' };
        const mockValidation = jest.spyOn(userValidator, 'newUser').mockImplementation();
        const mockBcryptHash = jest.spyOn(bcrypt, 'hash').mockImplementation(() => 'mockHashedPassword');
        const mockCreateUser = jest.spyOn(User, 'create').mockImplementation(() => Promise.resolve(mockCreatedUser));

        return request(server)
            .post('/api/v1/users/register')
            .send(requestBody)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(201)
            .expect((res) => {
                expect(mockValidation).toHaveBeenCalledWith(requestBody);
                expect(mockBcryptHash).toHaveBeenCalledWith('password', 11);
                expect(mockCreateUser).toHaveBeenCalledWith({ ...requestBody, password: 'mockHashedPassword' });
                expect(res.body).toEqual({ message: 'New user created', created: mockCreatedUser });
                done();
            });
    });

    test(`'/api/v1/users/login', authenticates user and returns a token`, async (done) => {
        const expectedToken = 'mocked.jwt';
        const requestBody = { username: 'shawn', password: 'password' };
        const mockValidation = jest.spyOn(userValidator, 'login').mockImplementation();
        const mockCreateAuthToken = jest.spyOn(authUtils, 'createAuthToken').mockImplementation(() => expectedToken);

        return request(server)
            .post('/api/v1/users/login')
            .send(requestBody)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .expect((res) => {
                expect(mockValidation).toHaveBeenCalledWith(requestBody);
                expect(mockCreateAuthToken).toHaveBeenCalledWith({ username: requestBody.username });
                expect(res.body).toEqual({ message: 'Login successful', token: expectedToken });
                done();
            });
    });
});
