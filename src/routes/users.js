
'use strict';
var express = require('express');
var router = express.Router();
//require User model
var User = require('../models/users');
//require authorisation
var auth = require('../auth.js');
// pass user get method through authorisation middleware and respond in parse-able format
router.get('/users', auth, function (req, res, next) {
  var authorisedUser = {};
  authorisedUser.data = [];
  authorisedUser.data.push(req.user);
  // send json response
  res.json(authorisedUser);
});
// create a new user route
router.post('/users', function (req, res, next) {
  // if passwords not filled out
  // create new User
  var user = new User();
  // assign schema fullName to the full name from request
  user.fullName = req.body.fullName;
  user.emailAddress = req.body.emailAddress;
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  // save the user
  user.save(function (err) {
    // if errors
    if (err) {
      // check for validation errors
      if (err.name === 'ValidationError') {
        var errorArray = [];
        for (var error in err.errors) {
          errorArray.push({
            code: 400,
            message: err.errors[error].message
          });
        }
        // format the errors to be consumed by the Angular front end
        var errorMessages = {
          message: 'Validation Failed',
          errors: { property: errorArray }
        };
        // send error response
        return res.status(400).json(errorMessages);
      } else {
        // else send error to error handler
        return next(err);
      }
    }
    res.status(201);
    res.location('/');
    res.end();
  });
});

module.exports = router;
