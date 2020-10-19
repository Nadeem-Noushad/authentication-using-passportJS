// for homepage...etc
const express = require('express');
const route = express.Router()


route.get('/', (req, res) => {
    res.render('welcome')
})

module.exports = route
