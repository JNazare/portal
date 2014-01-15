var CT = require('./modules/country-list');
var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');

var express = require('express')
  , routes = require('./routes')
  , login = require('./routes/login')
  , product = require('./routes/product')
  , development = require('./routes/development')
  , marketing = require('./routes/marketing')
  , sales = require('./routes/sales')
  , helpers = require('./routes/helpers')
  , http = require('http')
  , path = require('path');

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
  app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Home routes
app.get('/', routes.index);
app.get('/home', login.get_oauth_token);

// Login routes
app.get('/login', login.get_oauth_token);
app.get('/logout', login.logout);

// Track routes
app.get('/product', product.show);
app.get('/development', development.show);
app.get('/marketing', marketing.show);
app.get('/sales', sales.show);

// File routes
app.get('/product/:file', product.showlab);
app.get('/development/:file', development.showlab);
app.get('/marketing/:file', marketing.showlab);
app.get('/sales/:file', sales.showlab);

// Save routes
app.post('/product/:file/save', product.savelab);
app.post('/development/:file/save', development.savelab);
app.post('/marketing/:file/save', marketing.savelab);
app.post('/sales/:file/save', sales.savelab);

// New Login routes
app.get('/signup', function(req, res) {
  req.logged_in = false;
    res.render('signup', {  title: 'Signup', countries : CT });
  });
  
  app.post('/signup', function(req, res){
    req.logged_in = false;
    AM.addNewAccount({
      name  : req.param('name'),
      email   : req.param('email'),
      user  : req.param('user'),
      pass  : req.param('pass'),
      country : req.param('country')
    }, function(e){
      if (e){
        res.send(e, 400);
      } else{
        res.redirect("/");
      }
    });
  });

app.post('/', function(req, res){
    AM.manualLogin(req.param('user'), req.param('pass'), function(e, o){
      if (!o){
        res.send(e, 400);
      } else{
          req.session.user = o;
        if (req.param('remember-me') == 'true'){
          res.cookie('user', o.user, { maxAge: 900000 });
          res.cookie('pass', o.pass, { maxAge: 900000 });
        }
        res.redirect("/login");
      }
    });
  });

app.post('/lost-password', function(req, res){
  req.logged_in = false;
  // look up the user's account via their email //
    AM.getAccountByEmail(req.param('email'), function(o){
      if (o){
        res.send('ok', 200);
        EM.dispatchResetPasswordLink(o, function(e, m){
        // this callback takes a moment to return //
        // should add an ajax loader to give user feedback //
          if (!e) {
          //  res.send('ok', 200);
          } else{
            res.send('email-server-error', 400);
            for (k in e) console.log('error : ', k, e[k]);
          }
        });
      } else{
        res.send('email-not-found', 400);
      }
    });
  });

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
