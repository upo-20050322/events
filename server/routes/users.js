'use strict';

const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { checkSchema } = require('express-validator');
const userSchema = require('../validation/userSchema');
const handleValidationErrors = require('../middleware/handleValidationErrors');
const auth = require('../middleware/auth');

router.get('/', 
    auth.isAuthenticated, 
    usersController.getUser
);

router.get('/organizer/:organizerId', 
    usersController.getOrganizer
);

router.get('/user/:userId', 
    auth.isAuthenticated, 
    auth.isAdmin,
    usersController.getUserById
);


router.post('/filter', 
    auth.isAuthenticated, 
    auth.isAdmin, 
    usersController.getUsers
);

router.put('/first-name', 
    auth.isAuthenticated, 
    checkSchema({ firstName: userSchema.firstName }), 
    handleValidationErrors, 
    usersController.updateFirstName
);

router.put('/last-name', 
    auth.isAuthenticated, 
    checkSchema({ lastName: userSchema.lastName }), 
    handleValidationErrors, 
    usersController.updateLastName
);

router.put('/email', 
    auth.isAuthenticated, 
    checkSchema({ email: userSchema.email }), 
    handleValidationErrors, 
    usersController.updateEmail
);

router.put('/password', 
    auth.isAuthenticated, 
    checkSchema({ newPassword: userSchema.password }), 
    handleValidationErrors, 
    usersController.updatePassword
);

router.put('/profile-picture', 
    auth.isAuthenticated, 
    usersController.updateProfilePicture
);

router.delete('/profile-picture', 
    auth.isAuthenticated, 
    usersController.deleteProfilePicture
);

router.delete('/', 
    auth.isAuthenticated, 
    usersController.deleteUser
);

module.exports = router;