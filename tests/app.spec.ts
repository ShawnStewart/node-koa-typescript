import { bold, green, italic, red, yellow } from 'chalk';
import { Server } from 'http';
import { Context } from 'koa';
import request from 'supertest';

import app, { loggingHandler, errorHandler } from '../src/app';
import { InternalServerError, InvalidEndpointError } from '../src/errors';

describe('Sanity check', () => {
    test('has process.env.NODE_ENV as "test"', () => {
        expect(process.env.NODE_ENV).toEqual('test');
    });
});

describe('Server', () => {
    let server: Server;

    beforeAll((done) => {
        server = app.listen();
        done();
    });

    afterAll((done) => {
        server.close();
        done();
    });

    test('throws InvalidEndpointError on requests to uknown endpoints', async (done) => {
        const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

        return request(server)
            .get('/invalid-endpoint')
            .expect(404)
            .expect((res) => {
                expect(res.body).toMatchObject({ ...new InvalidEndpointError('GET', '/invalid-endpoint') });
                expect(mockConsoleError).toHaveBeenCalledTimes(1);
                done();
            });
    });
});

describe('Logging handler', () => {
    const ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...ENV };
        process.env.NODE_ENV = 'not_test';
    });

    afterEach(() => {
        process.env = ENV;
    });

    const createMockContext = (status: number, method: string, url: string) => {
        return { response: { status }, method, url } as Context;
    };

    const formatRequestLog = (ctx: Context, responseTime: string) => {
        const status = bold(ctx.response.status);
        const method = bold(ctx.method);
        const url = italic(ctx.url);

        return `${status} ${method} ${url} - ${responseTime}`;
    };

    test('200 requests log green', async () => {
        const mockContext = createMockContext(200, 'GET', '/some/url');
        const mockResponseTime = '123ms';
        mockContext.response.get = () => mockResponseTime;
        const mockNext = jest.fn();

        const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
        const expectedOutput = formatRequestLog(mockContext, mockResponseTime);

        await loggingHandler(mockContext, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockConsoleLog).toHaveBeenCalledWith(green(expectedOutput));
    });

    test('300 requests log yellow', async () => {
        const mockContext = createMockContext(300, 'GET', '/some/url');
        const mockResponseTime = '123ms';
        mockContext.response.get = () => mockResponseTime;
        const mockNext = jest.fn();

        const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
        const expectedOutput = formatRequestLog(mockContext, mockResponseTime);

        await loggingHandler(mockContext, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockConsoleLog).toHaveBeenCalledWith(yellow(expectedOutput));
    });

    test('400+ requests log red', async () => {
        const mockContext = createMockContext(400, 'GET', '/some/url');
        const mockResponseTime = '123ms';
        mockContext.response.get = () => mockResponseTime;
        const mockNext = jest.fn();

        const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
        const expectedOutput = formatRequestLog(mockContext, mockResponseTime);

        await loggingHandler(mockContext, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockConsoleLog).toHaveBeenCalledWith(red(expectedOutput));
    });
});

describe('Error handling', () => {
    test('sends internal server error with a message if no response is set', async () => {
        const mockContext = { response: {} } as Context;
        const mockNext = jest.fn();
        const expectedResponse = {
            body: new InternalServerError(
                'Sorry about that! Your request did not fail, but we did not set a response.',
            ),
            status: 500,
        };

        await errorHandler(mockContext, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockContext).toMatchObject({ response: expectedResponse });
    });
});
