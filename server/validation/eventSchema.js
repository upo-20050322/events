'use strict';

module.exports = {
    title: {
        isString: { bail: true },
        trim: true,
        isLength: {
            options: {
                min: 1,
                max: 128
            }
        },
        errorMessage: 'Title must be 1-128 characters long'
    },
    description: {
        isString: { bail: true },
        trim: true,
        isLength: {
            options: {
                min: 1,
                max: 4096
            }
        },
        errorMessage: 'Description must be 1-1024 characters long'
    },
    category: {
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
        ]] },
        errorMessage: 'Category is not valid'
    },
    date: {
        isISO8601: true,
        errorMessage: 'Date is not valid'
    },
    latitude: {
        isFloat: {
            options: {
                min: -90,
                max: 90
            },
            errorMessage: 'Latitude is not valid'
        }
    },
    longitude: {
        isFloat: {
            options: {
                min: -180,
                max: 180
            },
            errorMessage: 'Longitude is not valid'
        }
    },
    registrationCost: {
        matches: {
            options: /^[0-9]+(\.[0-9]+)?$/
        },
        errorMessage: 'Registration cost is not valid'
    }
};