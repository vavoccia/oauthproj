// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
// load up the user model

var users            = require('../db/db').db.create();
var configAuth = require('./auth');
//var User = users.list();
var model = require('../db/model');
// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        users.findById(id).then((user) =>{
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
            if(!req.user) {
                users.findOne('local.email', email)
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
            }
            else {
                // user already exists and is logged in, we have to link accounts
                var user           = req.user; // pull the user out of the session
                // update the current users facebook credentials
                    user.local.email = email;
                    user.local.password = users.generateHash(password);
                // save the user
                users.findByIdAndUpdate(user.id, user).then (function(user) {
                    return done(null, user);
                })
                .catch((err)=>{
                    console.log(err);
                });                
            }  
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
        users.findOne('local.email',email )
            .then((user) => {
            

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!users.validPassword('local.password', password, user))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));


    // =========================================================================
    // OLD FACEBOOK ============================================================
    // =========================================================================
    // passport.use('facebook', new FacebookStrategy({

    //     // pull in our app id and secret from our auth.js file
    //     clientID        : configAuth.facebookAuth.clientID,
    //     clientSecret    : configAuth.facebookAuth.clientSecret,
    //     callbackURL     : configAuth.facebookAuth.callbackURL,
    //     passReqToCallback : true ,// allows us to pass back the entire request to the callback
    //     profileFields: ['id', 'emails', 'name']
    // },

    // // facebook will send back the token and profile
    // function(req, token, refreshToken, profile, done) {

    //     // asynchronous
    //     process.nextTick(function() {
    //         req.flash('loginMessage', 'Oops! Wrong password.');
    //         // find the user in the database based on their facebook id
    //         users.findOne( 'facebook.id', profile.id ).then( (user) => {

    //             // if there is an error, stop everything and return that
    //             // ie an error connecting to the database
    //             //if (err)
    //             //  return done(err);
 
    //             // if the user is found, then log them in
    //             if (user) {
    //                 return done(null,user); // user found, return that user
    //             } else {
    //                 // if there is no user found with that facebook id, create them
    //                 var newUser            = new model();

    //                 // set all of the facebook information in our user model
    //                 newUser.facebook.id    = profile.id; // set the users facebook id                   
    //                 newUser.facebook.token = token; // we will save the token that facebook provides to the user                    
    //                 newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
    //                 newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

    //                 // save our user to the database
    //                 users.save(newUser).then ( (user) => {
    //                     // if successful, return the new user
    //                     return done(null, user);
    //                 });
    //             }

    //         });
    //     });

    // }));

    // =========================================================================
    // NEW FACEBOOK ============================================================
    // =========================================================================

    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        passReqToCallback : true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        profileFields: ['id', 'emails', 'name']
    },

    // facebook will send back the token and profile
    function(req, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

                // find the user in the database based on their facebook id
                users.findOne('facebook.id', profile.id) .then( (user)=> {

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database

                    // if the user is found, then log them in
                    if (user) {
                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user found with that facebook id, create them
                        var newUser            = new model();

                        // set all of the facebook information in our user model
                        newUser.facebook.id    = profile.id; // set the users facebook id                   
                        newUser.facebook.token = token; // we will save the token that facebook provides to the user                    
                        newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                        newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                        // save our user to the database
                        users.save(newUser).then((user) => {
                                console.log(user);
                                return done(null, newUser);
                            }, 
                            (err) => {
                                console.log(err);
                                return(err,null);
                            }
                        );
                    }

                },
                //Handle Promise Reject
                (err) => {console.log(err)}
            );

            } else {
                // user already exists and is logged in, we have to link accounts
                var user           = req.user; // pull the user out of the session

                // update the current users facebook credentials
                user.facebook.id    = profile.id;
                user.facebook.token = token;
                user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                user.facebook.email = profile.emails[0].value;

                // save the user
                users.findByIdAndUpdate(user.id, user).then (function(user) {
                    return done(null, user);
                })
                .catch((err)=>{
                    console.log(err);
                });
            }

        });

    }));

};    

