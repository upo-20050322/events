'use strict';

exports.notFound = (req, res, next) => {
    res.status(404);
    next(new Error(`${req.method} ${req.originalUrl} not found`));
}

exports.handleServerError = function (err, req, res, next) {
    console.error(err);
    if (res.statusCode >= 200 && res.statusCode <= 299) res.status(500);
    if (!res.headersSent) res.json({ error : err.message || 'Internal Server Error' });
}