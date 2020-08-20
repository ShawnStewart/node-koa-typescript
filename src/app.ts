import { bold, green, italic, red, yellow } from 'chalk';
import Koa, { Context, Next } from 'koa';
import bodyParser from 'koa-bodyparser';

import { InternalServerError, InvalidEndpointError } from './errors';
import routes from './routes';

const app = new Koa();

// Middleware
app.use(bodyParser());

// Logging
export const loggingHandler = async (ctx: Context, next: Next): Promise<void> => {
    await next();

    if (process.env.NODE_ENV === 'test') {
        return;
    }

    const status = bold(ctx.response.status);
    const method = bold(ctx.method);
    const url = italic(ctx.url);
    const responseTime = ctx.response.get('X-Response-Time');

    const message = `${status} ${method} ${url} - ${responseTime}`;
    // const color = !ctx.response.status ? yellow : ctx.response.status < 300 ? green : red;
    const color = ctx.response.status < 300 ? green : ctx.response.status < 400 ? yellow : red;

    console.log(color(message));
};
app.use(loggingHandler);

// Timing
app.use(
    async (ctx: Context, next: Next): Promise<void> => {
        const start = Date.now();
        await next();
        const delta = Date.now() - start;
        ctx.set('X-Response-Time', `${delta}ms`);
    },
);

// Error handling
export const errorHandler = async (ctx: Context, next: Next): Promise<void> => {
    try {
        await next();
        if (!ctx.response.body) {
            throw new InternalServerError(
                'Sorry about that! Your request did not fail, but we did not set a response.',
            );
        }
    } catch (e) {
        console.error(`\n${e.stack}`);

        const errorResponse = !e.status ? new InternalServerError() : e;
        ctx.response.status = errorResponse.status;
        ctx.response.body = errorResponse;
    }
};
app.use(errorHandler);

// Apply routes
app.use(routes.routes()).use(routes.allowedMethods());

// 404 - Unknown endpoint
app.use(
    async (ctx: Context): Promise<void> => {
        throw new InvalidEndpointError(ctx.request.method, ctx.request.originalUrl);
    },
);

export default app;
