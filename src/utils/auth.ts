import { JsonWebTokenError, sign, SignOptions, TokenExpiredError, verify } from 'jsonwebtoken';
import { Context, Next } from 'koa';

import { AuthTokenExpiredError, InternalServerError, UnauthorizedError } from '../errors';

export const authRequired = async (ctx: Context, next: Next) => {
    const token = ctx.get('authorization')?.split(' ')[1];
    const secret = process.env.API_SECRET_KEY as string;

    if (!token) {
        throw new UnauthorizedError();
    }

    try {
        await verify(token, secret);
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            throw new AuthTokenExpiredError(error.expiredAt);
        } else if (error instanceof JsonWebTokenError) {
            throw new UnauthorizedError();
        }

        throw new InternalServerError(error);
    }

    await next();
};

export const createAuthToken = (payload: string | object | Buffer): string => {
    const secret = process.env.API_SECRET_KEY as string;
    const options: SignOptions = {
        expiresIn: 7 * 24 * 60 * 60,
    };

    return sign(payload, secret, options);
};
