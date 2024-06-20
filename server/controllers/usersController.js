'use strict';

const userDAO = require('../models/userDAO');
const eventDAO = require('../models/eventDAO');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

function capitalize(str) {
    return str.replace(/\b\w/g, function (char) {
        return char.toUpperCase();
    });
}


exports.getUser = (req, res, next) => res.json(req.user);

exports.getOrganizer = async (req, res, next) => {
    try {
        const organizerId = req.params.organizerId;
        if (isNaN(organizerId)) {
            res.status(400);
            return next(new Error('Organizer Id is not valid'));
        }
    
        const organizer = await userDAO.getUserById(organizerId);
        if (organizer.error || (organizer.role !== 'organizer' && organizer.role !== 'administrator')) {
            res.status(404);
            return next(new Error('Organizer not found'));
        }
    
        res.status(200).json({
            organizerId:    organizer.userId,
            firstName:      organizer.firstName,
            lastName:       organizer.lastName,
            email:          organizer.email,
            profilePicture: organizer.profilePicture
        });
    } catch (error) {
        res.status(400);
        return next(error);
    }
}

exports.getUserById = async (req, res, next) => {
    const user = await userDAO.getUserById(req.params.userId);

    if (user.error) return next(new Error(user.error));

    res.status(200).json({
        userId:         user.userId,
        firstName:      user.firstName,
        lastName:       user.lastName,
        email:          user.email,
        role:           user.role,
        profilePicture: user.profilePicture
    });
}

exports.getUsers = async (req, res, next) => {
    try {
        res.status(200).json(await userDAO.getUsers(req.body.filter, req.body.offset, req.body.limit));
    } catch (error) {
        res.status(400);
        return next(error);
    }
}

exports.updateFirstName = async (req, res, next) => {
    const user = req.user.role === 'administrator' ? await userDAO.getUserById(req.body.userId) : req.user;
    const { firstName } = req.body;
    
    try {
        await userDAO.updateFirstName(user.userId, capitalize(firstName));
    } catch (error) {
        res.status(400);
        return next(error);
    }
    
    res.sendStatus(200);
};

exports.updateLastName = async (req, res, next) => {
    const user = req.user.role === 'administrator' ? await userDAO.getUserById(req.body.userId) : req.user;
    const { lastName } = req.body;
    
    try {
        await userDAO.updateLastName(user.userId, capitalize(lastName));
    } catch (error) {
        res.status(400);
        return next(error);
    }
    
    res.sendStatus(200);
};

exports.updateEmail = async (req, res, next) => {
    const user = req.user.role === 'administrator' ? await userDAO.getUserById(req.body.userId) : req.user;
    const { email } = req.body;
    const existingUser = await userDAO.getUserByEmail(email);
    const emailAlreadyInUse = !existingUser.error;

    if (emailAlreadyInUse) {
        res.status(400);
        return next(new Error('Email already in use'));
    }
    
    try {
        await userDAO.updateEmail(user.userId, email);
    } catch (error) {
        res.status(400);
        return next(error);
    }
    
    res.sendStatus(200);
};

exports.updatePassword = async (req, res, next) => {
    const user = req.user.role === 'administrator' ? await userDAO.getUserById(req.body.userId) : req.user;
    const { oldPassword, newPassword } = req.body;
    
    try {
        if (req.user.role !== 'administrator' && !await bcrypt.compare(oldPassword, user.password)) {
            res.status(400);
            return next(new Error('Password is not correct'));
        }

        await userDAO.updatePassword(user.userId, await bcrypt.hash(newPassword, 10));

        res.sendStatus(200);
        
    } catch (error) {
        res.status(400);
        return next(error);
    }
    
};

exports.updateProfilePicture = async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.profilePicture) {
        res.status(400);
        return next(new Error('No files were uploaded'));
    }

    const user = req.user.role === 'administrator' ? await userDAO.getUserById(req.body.userId) : req.user;
    const profilePicture = Array.isArray(req.files.profilePicture) ? req.files.profilePicture[0] : req.files.profilePicture;
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const fileExtension = path.extname(profilePicture.name);
    const uploadPath = '/users/'+ uuid.v4() + path.extname(profilePicture.name);
    
    if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
        res.status(400);
        return next(new Error('Only .jpg, .jpeg and .png files are allowed'));
    }

    if (user.profilePicture !== null) {
        fs.unlink(path.join(__dirname, '/../../upload', user.profilePicture), (err) => {
            if (err) return next(err);
        });
    }

    profilePicture.mv(path.join(__dirname, '/../../upload', uploadPath), async err => {
        if (err) return next(err);

        await userDAO.updateProfilePicture(user.userId, uploadPath);
    })
    
    res.sendStatus(200);
};

exports.deleteProfilePicture = async (req, res, next) => {
    try {
        const user = req.user.role === 'administrator' ? await userDAO.getUserById(req.query.userId) : req.user;
        if (user.profilePicture !== null) {
            fs.unlink(path.join(__dirname, '/../../upload', user.profilePicture), (err) => {
                if (err) return next(err);
            });
        }

        userDAO.updateProfilePicture(user.userId, null);
        
        res.sendStatus(200);
    } catch (error) {
        return next(error);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const user = req.user.role === 'administrator' ? await userDAO.getUserById(req.query.userId) : req.user;

        if (user.profilePicture !== null) {
            fs.unlink(path.join(__dirname, '/../../upload', user.profilePicture), (err) => {
                if (err) return next(err);
            });
        }

        if (user.role === 'organizer') {
            const events = await eventDAO.getEvents({organizerId: user.userId});
            events.forEach(async event => {
                event.imagePaths.forEach(imagePath => {
                    fs.unlink(path.join(__dirname, '/../../upload', imagePath), (err) => {
                        if (err) return next(err);
                    });
                })

                await eventDAO.deleteEvent(event.eventId);
            });

        }
        
        if (req.user.role !== 'administrator') req.logOut(err => {
            if (err) return next(err);
        });
        
        await userDAO.deleteUser(user.userId);
        
        res.sendStatus(200);
    } catch (error) {
        res.status(400);
        return next(error);
    }

};
