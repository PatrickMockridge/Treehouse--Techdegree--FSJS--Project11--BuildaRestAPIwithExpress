
'use strict';
var User = require('./models/users');
var basicAuth = require('basic-auth');
var bcrypt = require('bcrypt');
var auth = function (req, res, next) {
// send unauthorised status
  function unauthorised (res) {
    // unauthorised response sent 
    return res.send(401);
  }

  // uses basic-auth to to parse authorization requests
  var user = basicAuth(req);

  // if credentials not present
  if (!user || !user.name || !user.pass) {
    // unauthorised
    return unauthorised(res);
  } else {
    // else qury the db for the user email
    User.findOne({emailAddress: user.name}, function (err, email) {
      // if error, handle error
      if (err) return next(err);
      // if email response
      if (email) {
        // compare the password with the hashed password using bCrypt
        if (bcrypt.compareSync(user.pass, email.hashedPassword)) {
          // if true store the email in req.user & pass it to the next handler
          req.user = email;
          return next();
        } else {
          // else unauthorised
          return unauthorised(res);
        }
      } else {
        // if query returns null: unauthorised
        return unauthorised(res);
      }
    });
  }
};

module.exports = auth;
