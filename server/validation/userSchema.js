'use strict';

module.exports = {
    firstName: {
        isString: { bail: true },
        matches: { 
            options: /^[A-Za-z ]+$/, 
            bail: true 
        }, 
        isLength: {
            options: {
                min: 3,
                max: 50
            }
        },
        errorMessage: 'First Name must be 3-50 characters long and contain only letters'
    },
    lastName: {
        isString: { bail: true }, 
        matches: { 
            options: /^[A-Za-z ]+$/, 
            bail: true 
        }, 
        isLength: {
            options: {
                min: 3,
                max: 50
            }
        },
        errorMessage: 'Last Name must be 3-50 characters long and contain only letters'
    },
    email: {
        isEmail: { bail: true }, 
        isLength: {
            options: {
                min: 5,
                max: 50
            }
        },
        errorMessage: 'Email is not valid'
    },
    password: {
        isString: { bail: true }, 
        isLength: {
            options: {
                min: 8,
                max: 50
            }
        },
        matches: { 
            options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+/, 
            bail: true 
        },
        errorMessage: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
    },
    role: {
        isIn: { options: [['organizer', 'participant']] },
        errorMessage: 'Role is not valid'
    }
};