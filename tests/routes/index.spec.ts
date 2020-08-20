import { Server } from 'http';
import request from 'supertest';

import app from '../../src/app';

describe('index router', () => {
    let server: Server;

    beforeAll((done) => {
        server = app.listen();
        done();
    });

    afterAll((done) => {
        server.close();
        done();
    });

    test(`'/' redirects to '/health'`, async (done) => {
        return request(server)
            .get('/')
            .expect('location', '/health')
            .expect(301)
            .then(() => done());
    });

    test(`'/health'`, async (done) => {
        return request(server)
            .get('/health')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .expect((res) => {
                expect(res.body).toMatchObject({ message: 'Application is running', success: true });
                done();
            });
    });
});
