
'use strict';
// require express
var express = require('express');
// require morgan for logging
var logger = require('morgan');
// require json parser
var jsonParser = require('body-parser').json;
// require mongoose models
require('./models/courses');
require('./models/reviews');
require('./models/users');
// require DB
require('./database');
// define app as express instance
var app = express();
// require routes
var routes = require('./routes');

// set port to 5000
app.set('port', process.env.PORT || 5000);

// logger for http logging
app.use(logger('dev'));
// used to parse json
app.use(jsonParser());

// serve static files from public folder
app.use('/', express.static('public'));
app.use('/api', routes.course);
app.use('/api', routes.review);
app.use('/api', routes.user);

// Sets up error handlers.
// Add a middleware function to catch 404 errors and forward an error to the global error handler.
// catch 404 & forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Adds a global error handler middleware function that writes error information to the response in the JSON format.
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message
    }
  });
});

// start listening on our port
var server = app.listen(app.get('port'), function () {
  console.log("Let's roll out on port " + server.address().port);
});
