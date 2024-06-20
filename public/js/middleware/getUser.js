'use strict';

import authApi from '../api/authApi.js';

export default async function authenticate(ctx, next) {
    try {
        ctx.user = (await authApi.checkAuthentication()).user;
        next(ctx);
    } catch (error) {
        console.error(error.message);
    }
}