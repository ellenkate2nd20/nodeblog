var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var multer = require('multer');
var expressMessages = require('express-messages');
var flash = require('connect-flash');
var mongo = require('mongodb');

var indexRouter = require('./routes/index');
var postsRouter = require('./routes/posts');
var categoriesRouter = require('./routes/categories');

var db = require('monk')('localhost/nodeblog');
var upload = multer({dest: './uploads'});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// connect flash
app.use(flash());
app.use(function(req, res, next)
{
	res.locals.messages = expressMessages(req, res);
	next();
});

// handle sessions
app.use(session(
{
	secret: 'secret',
	saveUninitialized: true,
	resave: true
}));

// express validator
app.use(expressValidator(
{
	errorFormatter: function(param, msg, value)
	{
		var namespace = param.split('.');
		var formParam = namespace.shift();

		while(namespace.length)
		{
			formParam += '[' + namespace.shift() + ']';
		}

		return {
			param: formParam,
			msg: msg,
			value: value
		};
	}
}));

// make db accessible to router
app.use(function(req, res, next)
{
	req.db = db;
	next();
})

app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/categories', categoriesRouter);

app.locals.moment = require('moment');
app.locals.truncateText = function(text, length)
{
	var truncateText = text.substring(0, length);
	return truncateText;
}

// catch 404 and forward to error handler
app.use(function(req, res, next)
{
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next)
{
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
