var express = require('express');
var passport = require('passport');
var flash    = require('connect-flash');
var _ = require('lodash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser =require('body-parser');
var passport = require('passport');
var ejs = require('ejs');
var path = require('path');
var fs = require("fs");
fs.existsSync = fs.existsSync || require('path').existsSync;
require('./config/passport')(passport);
//var db = require('./db/db').db;
//var users = db.create();
var app = express();
var port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(bodyParser());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(session(
    {
        secret: 'anystringoftext',
	    saveUninitialized: false,
        resave: false
    })
);

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./app/authroutes')(app, passport, express);


app.listen(port, () => {
    console.log( 'Server Up On PORT : ' + port);
});
