var userModel = require('../db/model');
var users = require('../db/db').db;
module.exports = function(app, express) {
    var router = express.Router();
    router.use(function(req, res, next) {

        // log each request to the console
        console.log(req.method, req.url);

        // continue doing what we were doing and go to the route
        next(); 
    });

    router.post('/signup', function(req, res) {
    var user = new userModel({user:req.body.email, email:req.body.email, pwd:req.body.password});
    users.save(user).then(function(doc) {
        res.redirect('/');
    }, function(e) {
        res.status(400).send(e);
    });
    });

    router.get('/', (req, res) => {
        res.render('index.ejs');
    });

    router.get('/signup', (req, res) => {
        res.render('signup.ejs',{ message: req.flash('loginMessage') });
    });

    router.get('/login', (req, res) => {
        res.render('login.ejs',{ message: req.flash('signupMessage') });
    });

    app.use('/', router);

};