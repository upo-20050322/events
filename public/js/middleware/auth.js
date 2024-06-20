'use strict';

import page from '//unpkg.com/page/page.mjs';

const auth = {};

auth.isAuthenticated = function (ctx, next) {
    if (ctx.user) next();
    else page(`/auth/login/?redirect=${ctx.path}`);
}

auth.isNotAuthenticated = function (ctx, next) {
    if (!ctx.user) next();
    else page('/');
}

auth.isOrganizer = function (ctx, next) {
    if (ctx.user.role === 'organizer') next();
    else page('/');
}

auth.isParticipant = function (ctx, next) {
    if (ctx.user.role === 'participant') next();
    else page('/');
}

auth.isAdmin = function (ctx, next) {
    if (ctx.user.role === 'administrator') next();
    else page('/');
}

auth.isNotAdmin = function (ctx, next) {
    if (ctx.user && ctx.user.role === 'administrator') page('/admin/events');
    else next();
}

export default auth;