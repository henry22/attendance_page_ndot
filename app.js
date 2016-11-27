var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    User = require('./models/user.js');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/user_base');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');


//Passport Configuration
app.use(require('express-session')({
    secret: 'You have successfully logged in',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});


app.get('/', function(req, res) {
    res.send('<h1>welcome to the home page</h1>');
});


//Index - show all users
app.get('/users/new', function(req, res) {
    
    
    //retrieve data from database
    User.find({}, function(err, allUsers) {
        if(err) {
            console.log(err);
        } else {
            res.render('index', {posts: allUsers});
        }
    });  
});

//New - show form to create a new user
app.get('/users', function(req, res) {
    res.render('new', {currentUser: req.user});
});

//Create - create a new user and add to DB
app.post('/users/new', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    
    var newUser = {username: username, password: password};
    
    //create a new user and add to the database
    User.create(newUser, function(err, newlyCreated) {
        if(err) {
            console.log(err);
        } else {
            res.redirect('/users/new');
        }
    });
});

/* Authentication */

//Show sign up form 
app.get('/register', function(req, res) {
    res.render('register');
});

//Handling user sign up
app.post('/register', function(req, res) {
    var newUser = new User({username: req.body.username});
    
    User.register(newUser, req.body.password, function(err, user) {
        if(err) {
            console.log(err);
            res.render('register');
        }
        passport.authenticate('local')(req, res, function() {
            res.redirect('/users');
        });
    });
});

//Show login form
app.get('/login', function(req, res) {
    res.render('login');
});

//Login logic
app.post('/login', passport.authenticate('local', {
    successRedirect: '/users',
    failureRedirect: '/login'
}), function(req, res) {
});

//Logout route
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/users');
});

/* Human Resource panel */
app.get('/dashboard', function(req, res) {
    res.render('main');
});


//Set the port
app.listen(3000, function() {
    console.log('server has started');
});