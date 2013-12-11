var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , login = require('./routes/login')
  , product = require('./routes/product')
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
app.get('/test', helpers.get_user);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
