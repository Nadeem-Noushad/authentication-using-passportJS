//for user login and registeration
const express = require('express');
const route = express.Router()
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const passport = require('passport');
const { ensureAuth } = require('../config/auth')
const fs = require('fs');
const path = require('path');


route.get('/login', (req, res) => {
    res.render('login')
})

route.get('/register', (req, res) => {
    res.render('register')
})

route.get('/dashboard', ensureAuth, (req, res) => {
    res.render('dashboard', {
        name: req.user.name
    })
})

//Register handle
route.post('/register', (req, res) => {
    const { name, email, password, confirmPassword } = req.body
    const errors = []

    //Form validation
    if (!name || !email || !password || !confirmPassword) {
        errors.push({ msg: 'Fill all the Blanks' })
    }

    //Checking if passwords math
    if (password !== confirmPassword) {
        errors.push({ msg: 'Passwords didnt match'})
    }

    //Checking if password is more than 6 char
    if (password.length < 6) {
        errors.push({ msg: 'Password should be atleast 6 characters'})
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            confirmPassword
        })
    } else {
        //Validation Success
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    //User exists // renders the same page with an error
                    errors.push({ msg: 'Email is already registered' })
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        confirmPassword
                    })
                } else {
                    //since its model, we use 'new' keyword to create a instance
                    const newUser = new User({
                        email, //same as { email: email, name: name ..}
                        name,
                        password
                    })
                    
                    //Logs email and password onto logger.txt
                    fs.appendFile(path.join(__dirname, '../logs', 'logger.txt'), `${newUser}, \n`, err => {if(err) throw err})
                    
                    //Hash Password using bcryptjs
                    bcrypt.genSalt(10, (err, salt) => 
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err
                            
                            //set password to hash(ie, encrypting)
                            newUser.password = hash
                            
                            //save user
                            newUser.save()
                                .then(user => {
                                    res.redirect('/users/login')
                                })
                                .catch(err => console.log(err) ) 
                        })
                    )//end of bcrypt
                }})
    }
})

//Login Handle
route.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/users/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next) //passport.authenticate is a funcn it seems, lol
})
 
//Logout Handle
route.get('/logout', (req, res) => {
    req.logout()
    req.flash('success_msg', 'You are now Logged out')
    res.redirect('/users/login')
})

module.exports = route  
