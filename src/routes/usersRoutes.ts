import { hash } from 'bcryptjs';
import { Context } from 'koa';
import Router from 'koa-router';

import User, { userValidator } from '../models/User';
import { authRequired, createAuthToken } from '../utils/auth';

const router = new Router();

router.get(
    '/',
    authRequired,
    async (ctx: Context): Promise<void> => {
        const users = await User.getAll();

        ctx.response.body = { users };
    },
);

router.post(
    '/register',
    async (ctx: Context): Promise<void> => {
        await userValidator.newUser(ctx.request.body);

        const { username, password, email } = ctx.request.body;
        const hashedPassword = await hash(password, 11);
        const createdUser = await User.create({ username, password: hashedPassword, email });

        ctx.response.status = 201;
        ctx.response.body = {
            message: 'New user created',
            created: createdUser,
        };
    },
);

router.post(
    '/login',
    async (ctx: Context): Promise<void> => {
        await userValidator.login(ctx.request.body);

        const payload = { username: ctx.request.body.username };
        const token = createAuthToken(payload);

        ctx.response.body = {
            message: 'Login successful',
            token,
        };
    },
);

export default router;
