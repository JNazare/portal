var express = require('express')
  , routes = require('./routes')
  , login = require('./routes/login')
  , lab = require('./routes/lab')
  , helpers = require('./routes/helpers')
  , models = require('./routes/models.js')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , flash = require('connect-flash')
  , mongoose = require ("mongoose")
  , mongodb = require('mongodb')
  , bcrypt = require('bcrypt')
  , LocalStrategy = require('passport-local').Strategy
  , SALT_WORK_FACTOR = 10;

var uristring = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/userdb';
mongoose.connect(uristring, function (err, res) {
  if (err) {
  console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
  console.log ('Succeeded connected to: ' + uristring);
  }
});

// User Schema
var userSchema = models.userSchema;

// Bcrypt middleware
userSchema.pre('save', function(next) {
  var user = this;

  if(!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if(err) return next(err);

    bcrypt.hash(user.password, salt, function(err, hash) {
      if(err) return next(err);
      user.password = hash;
      next();
    });
  });
});

// Password verification
userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if(err) return cb(err);
    cb(null, isMatch);
  });
};

// Seed a user
var User = mongoose.model('User', userSchema);
var user = new User({
  name: {
    first_name: "Juliana",
    last_name: "Nazare"
  },
  username: "juliana@si.com",
  password: "secret",
  access_token: "S1instructor",
  role: "instructor",
  city: "boston"
});

user.save(function(err) {
  if(err) {
    console.log(err);
  } else {
    console.log('user: ' + user.username + " saved.");
  }
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username, password, done) {
  User.findOne({ username: username.toLowerCase() }, function(err, user) {
    if (err) { return done(err); }
    if (!user) { return done(null, false, { message: 'Unknown user: ' + username.toLowerCase() }); }
    user.comparePassword(password, function(err, isMatch) {
      if (err) return done(err);
      if(isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid password' });
      }
    });
  });
}));

var app = express();
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({ secret: 'keyboard cat' }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', ensureAuthenticated, login.get_oauth_token);

app.get('/login', function(req, res){
  res.render('login', { user: req.user, message: req.session.messages });
});

app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      req.session.messages =  [info.message];
      return res.redirect('/login')
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/');
    });
  })(req, res, next);
});

app.get('/logout', function(req, res){
  req.logout();
  req.session.messages = "Logged out!"
  res.redirect('/login');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

function ensureAuthenticated(req, res, next) {
  console.log(req.isAuthenticated());
  if (req.isAuthenticated()) { 
    return next(); 
  }
  res.redirect('/login')
}

// Signup routes
app.get('/signup', login.signup);
app.post('/signup', login.signingup);

// File routes
app.get('/product/:file', ensureAuthenticated, lab.showlab);
app.get('/development/:file', ensureAuthenticated, lab.showlab);
app.get('/marketing/:file', ensureAuthenticated, lab.showlab);
app.get('/sales/:file', ensureAuthenticated, lab.showlab);

// Save routes
app.post('/product/:file/save', ensureAuthenticated, lab.savelab);
app.post('/development/:file/save', ensureAuthenticated, lab.savelab);
app.post('/marketing/:file/save', ensureAuthenticated, lab.savelab);
app.post('/sales/:file/save', ensureAuthenticated, lab.savelab);
