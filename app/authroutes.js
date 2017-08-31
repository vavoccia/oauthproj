var userModel = require('../db/model');
var users = require('../db/db').db;
module.exports = function (app, passport, express) {
    var router = express.Router();
    router.use(function (req, res, next) {

        // log each request to the console
        console.log(req.method, req.url);

        // continue doing what we were doing and go to the route
        next();
    });

    router.get('/',isLoggedIn, (req, res) => {
        res.render('index.ejs',{
            user : req.user // get the user out of session and pass to template
        });
    });

    router.get('/signup', (req, res) => {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    router.get('/login', (req, res) => {
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });


    router.get('/local_login', (req, res) => {
        res.render('local_login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    router.post('/local_login', passport.authenticate('local-login', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));    

    // =====================================
    // LOGOUT ==============================
    // =====================================
    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    router.use(function (req, res, next) {

        // log each request to the console
        console.log(req.method, req.url, req.sessionStore);

        // continue doing what we were doing and go to the route
        next();
    });
    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    router.get('/profile', isLoggedIn, function(req, res) {
        res.render('index.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    }); 

    router.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

 
    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    router.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

    // handle the callback after facebook has authenticated the user
 
    router.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/',
            failureRedirect : '/login'
    }));   

    // router.get('/auth/facebook/callback', function(req, res, next) {
    //     if( req.user) {
    //         passport.authorize('facebook', {
    //             successRedirect : '/profile',
    //             failureRedirect : '/'
    //         })(req, res, next);
    //     } else {
    //         passport.authenticate('facebook', {
    //             successRedirect : '/profile',
    //             failureRedirect : '/'
    //         })(req, res, next);

    //     } 
    // });

    //Link to Local Accounts

       // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        })); 

    //Link to other Social Accounts
    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

        // handle the callback after facebook has authorized the user
        app.get('/connect/facebook/callback',
            passport.authorize('facebook', {
                successRedirect : '/',
                failureRedirect : '/login'
            }));


    app.use('/', router);

};

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('login');
}
