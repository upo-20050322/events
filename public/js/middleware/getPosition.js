'use strict';

export default async function getPosition(ctx, next) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            ctx.latitude = position.coords.latitude;
            ctx.longitude = position.coords.longitude;
        });
    }

    next();
}