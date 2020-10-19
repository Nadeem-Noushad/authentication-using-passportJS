const mongoose = require('mongoose')
const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')

//loading User model
const user = require('../models/User')

module.exports = function (passport) {
    passport.use(
        new localStrategy({ usernameField: 'email' }, (email, password, done) => {
            //searching DB for the registered email address //promise 
            user.findOne({ email: email })
                .then(user => {
                    //if user is not found
                    if (!user) {
                        return done(null, false, {message: 'That email is not registered'})
                    }
                    
                    //Password Match; comparing(decrypting) user input(ed) password from login page and the hashed password(from DB) 
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if(err) throw err //checks for possible errors

                        if (isMatch) {
                            return done(null, user, {message: 'Success'})
                        } else {
                            return done(null, false, {message: 'Password incorrect'})
                        }
                    })
                })
                .catch(err => console.log(err))
        })
    )

    //copy paste from passportjs doc
    passport.serializeUser((user, done) => {
        done(null, user.id);
      });
      
    passport.deserializeUser(function(id, done) {
        user.findById(id, (err, user) => {
            done(err, user);
        });
      });
}