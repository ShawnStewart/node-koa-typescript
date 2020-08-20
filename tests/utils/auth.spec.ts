import jwt from 'jsonwebtoken';
import { Context } from 'koa';

import { AuthTokenExpiredError, InternalServerError, UnauthorizedError } from '../../src/errors';
import * as authUtils from '../../src/utils/auth';

const ENV = process.env;
const TEST_SECRET = 'this is a test secret';

beforeEach(() => {
    jest.resetModules();
    process.env = { ...ENV };
});

afterEach(() => {
    process.env = ENV;
});

describe('authRequired', () => {
    test('no auth provided throws UnauthorizedError and does not call next', async () => {
        const mockNext = jest.fn();
        const mockContext = {} as Context;
        mockContext.get = () => '';

        try {
            await authUtils.authRequired(mockContext, mockNext);
            fail('expected authRequired middleware to throw');
        } catch (error) {
            expect(mockNext).not.toHaveBeenCalled();
            expect(error).toBeInstanceOf(UnauthorizedError);
            expect(error.status).toEqual(401);
        }
    });

    test('invalid auth provided throws UnauthorizedError and does not call next', async () => {
        const invalidAuth = jwt.sign({ test: true }, 'incorrect secret key');
        const mockNext = jest.fn();
        const mockContext = {} as Context;
        mockContext.get = () => `Bearer ${invalidAuth}`;

        try {
            await authUtils.authRequired(mockContext, mockNext);
            fail('expected authRequired middleware to throw');
        } catch (error) {
            expect(mockNext).not.toHaveBeenCalled();
            expect(error).toBeInstanceOf(UnauthorizedError);
            expect(error.status).toEqual(401);
        }
    });

    test('expired auth throws AuthTokenExpiredError and does not call next', async () => {
        const expiredAuth = jwt.sign({ test: true }, TEST_SECRET, { expiresIn: 0 });
        const mockNext = jest.fn();
        const mockContext = {} as Context;
        mockContext.get = () => `Bearer ${expiredAuth}`;

        process.env.API_SECRET_KEY = TEST_SECRET;

        try {
            await authUtils.authRequired(mockContext, mockNext);
            fail('expected authRequired middleware to throw');
        } catch (error) {
            expect(mockNext).not.toHaveBeenCalled();
            expect(error).toBeInstanceOf(AuthTokenExpiredError);
            expect(error.status).toEqual(401);
        }
    });

    test('non JsonWebTokenErrors throw InternalServerError and does not call next', async () => {
        const token = jwt.sign({ test: true }, TEST_SECRET);
        const mockNext = jest.fn();
        const mockContext = {} as Context;
        mockContext.get = () => `Bearer ${token}`;

        const jwtVerifyStub = jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
            throw 'some other error';
        });
        process.env.API_SECRET_KEY = TEST_SECRET;

        try {
            await authUtils.authRequired(mockContext, mockNext);
            fail('expected authRequired middleware to throw');
        } catch (error) {
            expect(mockNext).not.toHaveBeenCalled();
            expect(jwtVerifyStub).toHaveBeenCalled();
            expect(error).toBeInstanceOf(InternalServerError);
            expect(error.status).toEqual(500);
        }
    });

    test('valid auth provided calls next', async () => {
        const token = jwt.sign({ test: true }, TEST_SECRET);
        const mockNext = jest.fn();
        const mockContext = {} as Context;
        mockContext.get = () => `Bearer ${token}`;

        process.env.API_SECRET_KEY = TEST_SECRET;
        await authUtils.authRequired(mockContext, mockNext);

        expect(mockNext).toHaveBeenCalled();
    });
});

describe('createAuthToken', () => {
    test('calls jsonwebtoken.sign', () => {
        const payload = { test: true, message: 'this is a test payload' };
        const expectedOptions = { expiresIn: 604800 };
        const expectedToken = 'mocked.jwt';
        const mockSignJWT = jest.spyOn(jwt, 'sign').mockImplementation(() => expectedToken);

        process.env.API_SECRET_KEY = TEST_SECRET;
        const actual = authUtils.createAuthToken(payload);

        expect(mockSignJWT).toHaveBeenCalledWith(payload, TEST_SECRET, expectedOptions);
        expect(actual).toEqual(expectedToken);
    });
});
