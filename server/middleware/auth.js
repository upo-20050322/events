'use strict';

exports.isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) next();
    else {
        res.status(401);
        next(new Error('Unauthorized'));
    }
}

exports.isNotAuthenticated = function (req, res, next) {
    if (!req.isAuthenticated()) next();
    else {
        res.status(403);
        next(new Error('Forbidden'));
    }
}

exports.isAdmin = function (req, res, next) {
    if (req.user.role === 'administrator') next();
    else {
        res.status(403);
        next(new Error('Forbidden'));
    }
}

exports.isOrganizer = function (req, res, next) {
    if (req.user.role === 'organizer' || req.user.role === 'administrator') next();
    else {
        res.status(403);
        next(new Error('Forbidden'));
    }
}

exports.isParticipant = function (req, res, next) {
    if (req.user.role === 'participant' || req.user.role === 'administrator') next();
    else {
        res.status(403);
        next(new Error('Forbidden'));
    }
}

