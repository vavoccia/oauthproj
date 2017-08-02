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

    router.get('/', (req, res) => {
        res.render('index.ejs');
    });

    router.get('/signup', (req, res) => {
        res.render('signup.ejs', { message: req.flash('loginMessage') });
    });

    router.get('/login', (req, res) => {
        res.render('login.ejs', { message: req.flash('signupMessage') });
    });

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
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    }); 

    router.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

 

    app.use('/', router);

};

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}