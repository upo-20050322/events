'use strict';

const passport = require('passport');
const bcrypt = require('bcrypt');
const userDAO = require('../models/userDAO');
const path = require('path');
const uuid = require('uuid');

function capitalize(str) {
    return str.replace(/\b\w/g, function (char) {
        return char.toUpperCase();
    });
}


exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) next(new Error());
        
        if (!user) {
            res.status(404);
            next(new Error(info.message));
        }

        req.logIn(user, (err) => {
            if (err) next(new Error(err));
            else return res.status(200).json(user);
        });
    })(req, res, next);
};

exports.logout = (req, res, next) => {
    req.logOut(err => {
        if (err) return next(err);
        res.sendStatus(200);
    });
};

exports.register = async (req, res, next) => {
    const { firstName, lastName, email, password, role } = req.body;

    const existingUser = await userDAO.getUserByEmail(email);
    const emailAlreadyInUse = !existingUser.error;
    if (emailAlreadyInUse) {
        res.status(400);
        return next(new Error('Email already in use'));
    }

    if (!req.files || Object.keys(req.files).length === 0) 
        await userDAO.addUser(capitalize(firstName), capitalize(lastName), email, await bcrypt.hash(password, 10), role, null);
    
    else {
        const profilePicture = req.files.profilePicture;
        const uploadPath = '/users/'+ uuid.v4() + path.extname(profilePicture.name);
        
        profilePicture.mv(path.join(__dirname, '/../../upload', uploadPath), async err => {
            if (err) return next(err);
        })
        
        try {
            await userDAO.addUser(firstName, lastName, email, await bcrypt.hash(password, 10), role, uploadPath);
        } catch (error) {
            next(error);
        }
    }
    
    res.sendStatus(201);
};

exports.checkAuthentication = (req, res) => {
    const authenticated = req.isAuthenticated();
    const user = authenticated ? req.user : null;

    res.status(200).json({ authenticated, user });
};