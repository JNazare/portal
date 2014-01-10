var express = require('express')
  , routes = require('./routes')
  , login = require('./routes/login')
  , lab = require('./routes/lab')
  , helpers = require('./routes/helpers')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , flash = require('connect-flash')
  , LocalStrategy = require('passport-local').Strategy;

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// only for development
var users = [
    { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com' }
  , { id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com' }
];

function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    process.nextTick(function () {
      findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
    });
  }
));


// Home routes
app.get('/home', login.get_oauth_token);
app.get('/signup', login.signup);

// Login routes
app.get('/', function(req, res){
  res.render('login', { user: req.user, logged_in: req.logged_in, message: req.flash('error')});
});

app.post('/', 
  passport.authenticate('local', { failureRedirect: '/', failureFlash: true}),
  function(req, res) {
    res.redirect('/loggingin');
});

app.get('/loggingin', login.get_oauth_token);
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// File routes
app.get('/product/:file', lab.showlab);
app.get('/development/:file', lab.showlab);
app.get('/marketing/:file', lab.showlab);
app.get('/sales/:file', lab.showlab);

// Save routes
app.post('/product/:file/save', lab.savelab);
app.post('/development/:file/save', lab.savelab);
app.post('/marketing/:file/save', lab.savelab);
app.post('/sales/:file/save', lab.savelab);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}

