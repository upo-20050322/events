'use strict';

const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        const user = await getUserByEmail(email)

        if (user.error) return done(null, false, { message: 'Incorrect email or password' });

        try {
            if (bcrypt.compareSync(password, user.password)) 
                done(null, {
                    userId:         user.userId,
                    firstName:      user.firstName,
                    lastName:       user.lastName,
                    email:          user.email,
                    role:           user.role,
                    profilePicture: user.profilePicture
                });
            else done(null, false, { message: 'Incorrect email or password' });
        
        } catch (err) {
            done(err);
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, authenticateUser));
    
    passport.serializeUser((user, done) => done(null, user.userId));
    
    passport.deserializeUser(async (id, done) => {
        const { userId, firstName, lastName, email, role, profilePicture } = await getUserById(id)
        return done(null, { userId, firstName, lastName, email, role, profilePicture });
    })
}

module.exports = initialize;