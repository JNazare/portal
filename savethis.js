var express = require('express')
  , routes = require('./routes')
  , login = require('./routes/login')
  , lab = require('./routes/lab')
  , helpers = require('./routes/helpers')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , flash = require('connect-flash')
  , mongoose = require ("mongoose")
  , mongodb = require('mongodb')
  , bcrypt = require('bcrypt')
  , LocalStrategy = require('passport-local').Strategy
  , SALT_WORK_FACTOR = 10;

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

// mongoose setup
var uristring = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/userdb';
mongoose.connect(uristring, function (err, res) {
  if (err) {
  console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
  console.log ('Succeeded connected to: ' + uristring);
  }
});

// // only for development
// var users = [
//     { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com' }
//   , { id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com' }
// ];

// function findById(id, fn) {
//   var idx = id - 1;
//   if (users[idx]) {
//     fn(null, users[idx]);
//   } else {
//     fn(new Error('User ' + id + ' does not exist'));
//   }
// }

// function findByUsername(username, fn) {
//   for (var i = 0, len = users.length; i < len; i++) {
//     var user = users[i];
//     if (user.username === username) {
//       return fn(null, user);
//     }
//   }
//   return fn(null, null);
// }

// passport.serializeUser(function(user, done) {
//   done(null, user.id);
// });

// passport.deserializeUser(function(id, done) {
//   findById(id, function (err, user) {
//     done(err, user);
//   });
// });

// passport.use(new LocalStrategy(
//   function(username, password, done) {
//     process.nextTick(function () {
//       findByUsername(username, function(err, user) {
//         if (err) { return done(err); }
//         if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
//         if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
//         return done(null, user);
//       })
//     });
//   }
// ));

var userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true},
});

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
var user = new User({ username: 'bob', email: 'bob@example.com', password: 'secret' });
user.save(function(err) {
  if(err) {
    console.log(err);
  } else {
    console.log('user: ' + user.username + " saved.");
  }
});


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});


// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy(function(username, password, done) {
  User.findOne({ username: username }, function(err, user) {
    if (err) { return done(err); }
    if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
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

app.post('/', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      req.session.messages =  [info.message];
      return res.redirect('/');
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/loggingin');
    });
  })(req, res, next);
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Home routes
app.get('/home', login.get_oauth_token);
app.get('/signup', login.signup);
app.post('/signup', login.signingup);
// Login routes
app.get('/', function(req, res){
  res.render('login', { user: req.user, logged_in: req.logged_in, message: req.flash('error')});
});

// app.post('/', 
//   passport.authenticate('local', { failureRedirect: '/', failureFlash: true}),
//   function(req, res) {
//     res.redirect('/loggingin');
// });

app.get('/loggingin', login.get_oauth_token);
// app.get('/logout', function(req, res){
//   req.logout();
//   res.redirect('/');
// });

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
  res.redirect('/login');
}

