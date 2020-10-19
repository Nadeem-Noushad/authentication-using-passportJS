const express = require('express');
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const passport = require('passport');
const flash = require('connect-flash')
const session = require('express-session')

const app = express()


//Passport config
require('./config/passport')(passport)

//DataBase
const db = require('./config/keys').MongoURI
mongoose.connect(db, {useNewUrlParser: true , useUnifiedTopology: true})
mongoose.connection.once('open', () => console.log('connection made'))

//EJS
app.use(expressLayouts)
app.set('view engine', 'ejs')

//Body Parser
app.use(express.urlencoded({extended: false}))

//express session //No idea what this is, but it does the job
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}))

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//flash connect
app.use(flash())

//Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next()
}) 

//Routes
app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))

const PORT = process.env.PORT || 8000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
