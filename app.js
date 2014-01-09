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

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
