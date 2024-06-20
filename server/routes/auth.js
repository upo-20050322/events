'use strict';

const router = require('express').Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { checkSchema } = require('express-validator');
const userSchema = require('../validation/userSchema');
const handleValidationErrors = require('../middleware/handleValidationErrors');

router.post('/login', 
    auth.isNotAuthenticated, 
    authController.login
);
    
router.post('/logout', 
    auth.isAuthenticated, 
    authController.logout
);

router.post('/register', 
    auth.isNotAuthenticated, 
    checkSchema(userSchema), 
    handleValidationErrors, 
    authController.register
);

router.get('/check-auth', 
    authController.checkAuthentication
);


module.exports = router;