var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , login = require('./routes/login')
  , product = require('./routes/product')
  , development = require('./routes/development')
  , marketing = require('./routes/marketing')
  , sales = require('./routes/sales')
  , intro = require('./routes/intro')
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

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/login', login.get_oauth_code);
app.get('/logout', login.logout);
app.get('/home', login.get_oauth_token);
app.get('/product', product.show);
app.get('/product/:file', product.showlab);
app.post('/product/:file/save', product.savelab);
app.get('/intro', intro.show);
app.get('/intro/:file', intro.showlab);
app.post('/intro/:file/save', intro.savelab);
app.get('/development', development.show);
app.get('/development/:file', development.showlab);
app.post('/development/:file/save', development.savelab);
app.get('/marketing', marketing.show);
app.get('/marketing/:file', marketing.showlab);
app.post('/marketing/:file/save', marketing.savelab);
app.get('/sales', sales.show);
app.get('/sales/:file', sales.showlab);
app.post('/sales/:file/save', sales.savelab);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
