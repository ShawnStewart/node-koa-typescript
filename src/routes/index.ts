import { Context } from 'koa';
import Router from 'koa-router';

import userRoutes from './usersRoutes';

const router = new Router();

router.redirect('/', '/health');
router.get(
    '/health',
    async (ctx: Context): Promise<void> => {
        ctx.response.body = {
            message: 'Application is running',
            success: true,
        };
    },
);

router.use('/api/v1/users', userRoutes.routes(), userRoutes.allowedMethods());

export default router;
