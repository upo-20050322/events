'use strict';

const { validationResult } = require('express-validator');

module.exports = function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        res.status(400);
        next(new Error(errors.array()[0].msg));
    } 
    
    next();
}