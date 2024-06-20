'use strict';

module.exports = {
    'filters.title': {
        optional: { nullable: true },
        isString: { bail: true },
        trim: true,
        isLength: {
            options: {
                max: 128
            }
        },
        errorMessage: 'Title must be 1-1024 characters long'
    },
    'filters.category': {
        optional: { nullable: true },
        isString: { bail: true },
        isIn: {
            options: [[
                "Music",
                "Arts and Crafts",
                "Food and Drink",
                "Sports and Fitness",
                "Technology",
                "Business and Networking",
                "Health and Wellness",
                "Education",
                "Fashion and Beauty",
                "Gaming",
                "Travel and Outdoor",
                "Family and Kids",
                "Charity and Causes",
                "Performing Arts",
                "Film and Media"
            ]]
        },
        errorMessage: 'Category is not valid'
    },
    'filters.date': {
        optional: { nullable: true },
        isISO8601: true,
        errorMessage: 'Date is not valid'
    },
    'filters.latitude': {
        optional: { nullable: true },
        isFloat: {
            options: {
                min: -90,
                max: 90
            },
            errorMessage: 'Latitude is not valid'
        }
    },
    'filters.longitude': {
        optional: { nullable: true },
        isFloat: {
            options: {
                min: -180,
                max: 180
            },
            errorMessage: 'Longitude is not valid'
        }
    },
    'filters.registrationCost': {
        optional: { nullable: true },
        isFloat: {
            errorMessage: 'Registration cost must be a float'
        }
    },
    'filters.organizer': {
        optional: { nullable: true },
        isString: {
            errorMessage: 'Organizer must be a string'
        }
    },
    limit: {
        optional: { nullable: true },
        isInt: {
            options: {
                min: 0
            },
            errorMessage: 'Limit must be an integer greater or equal to 0'
        }
    },
    offset: {
        optional: { nullable: true },
        isInt: {
            options: {
                min: 0
            },
            errorMessage: 'Offset must be an integer greater or equal to 0'
        }
    }
};