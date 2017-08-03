// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model

var users            = require('../db/db').db.create();

var User = users.list();
var model = require('../db/model');
// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.local.email);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        users.findById('local.email',id).then((user) =>{
            if(!user) throw 'Error: Can not deserialize User!';
            done(null, user);
        }).catch((err)=> {
            done(err, null);
        });     
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
            users.findOne('local.email',email)
                .then(function(user){
                    if (!user) {
                    console.log("User not found, adding User!");
                    var newUser = new model();
                    newUser.local.email = email;
                    newUser.local.password = users.generateHash(password);
                    users.save(newUser).then((user) => {
                        console.log(user);
                        return done(null, newUser);
                    }, (err) => {console.log(err);}
                    );
                    }else {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    }
                })
                .catch(function(e){
                    return done(e);
                });   
        });

    }));


    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne('local.email',email )
            .then((user) => {
            

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!User.validPassword('local.password', password, user))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));

};    

