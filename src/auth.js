
'use strict';

var User = require('./models/users');
var basicAuth = require('basic-auth');
var bcrypt = require('bcrypt');
var auth = function (req, res, next) {

  function unauthorised (res) {
    // res. send unauthorised
    return res.send(401);
  }
  // parse the Authorization header credentials
  var user = basicAuth(req);
  // if the user doesn't exist exist nor user.name nor user.pass
  if (!user || !user.name || !user.pass) {
    // return unauthorised
    return unauthorised(res);
  } else {
    // query user by email
    User.findOne({emailAddress: user.name}, function (err, email) {
      // handle error
      if (err) return next(err);
      // if user exists
      if (email) {
        // use bcrypt to compare given password with hashed password in the DB
        if (bcrypt.compareSync(user.pass, email.hashedPassword)) {
          // if true store the email in req.user & pass it to the next handler
          req.user = email;
          return next();
        } else {
          // else return unauthorised
          return unauthorised(res);
        }
      } else {
        // if user doesn't exist in the DB
        return unauthorised(res);
      }
    });
  }
};

module.exports = auth;
