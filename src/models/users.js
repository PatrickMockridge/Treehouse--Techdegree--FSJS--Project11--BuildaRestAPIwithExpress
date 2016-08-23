
'use strict';

var mongoose = require('mongoose');
var Validator = require('validator');
var bcrypt = require('bcrypt');
//define user schema
var UserSchema = new mongoose.Schema({
  // _id: {
  //   type: mongoose.Schema.Types.ObjectId
  // },
  fullName: {
    type: String,
    required: [true, 'Full name is required']
  },
  emailAddress: {
    type: String,
    required: [true, 'Email address is required']
  },
  hashedPassword: {
    type: String,
    required: true
  }
});
//,
//{
  //toObject: { virtuals: true },
  //toJSON: { virtuals: true }
//});
// hash password before saving from temporary virtual password value in Schema
UserSchema.virtual('password')
.get(function() {
  return this._password;
})
.set(function(value) {
  this._password = value;
  var salt = bcrypt.genSaltSync(12);
  this.hashedPassword = bcrypt.hashSync(value, salt);
});
// create 'confirm password' value in the schema
UserSchema.virtual('confirmPassword')
.get(function() {
  return this._confirmPassword;
})
.set(function(value) {
  this._confirmPassword = value;
});
// only accept the password if the confirm password and password match
UserSchema.path('hashedPassword').validate(function(v) {
  if (this._password || this._confirmPassword) {
    if (this._password !== this._confirmPassword) {
      this.invalidate('confirmPassword', 'the password fields must match');
    }
  }
  // if no password invalidate
  if (this.isNew && !this._password) {
    this.invalidate('password', 'a password is required');
  }
}, null);

// validate email
UserSchema.path('emailAddress').validate(function (v) {
  return Validator.isEmail(v);
}, 'Email is invalid.');

//ensure email is unique
UserSchema.path('emailAddress').validate(function (value, done) {
  this.model('User').count({ emailAddress: value }, function (err, count) {
    if (err) {
      return done(err);
    }
    // if count is greater than zero invalidate the request
    done(!count);
  });
}, 'This email address is already being used by another user.');
var User = mongoose.model('User', UserSchema);
module.exports = User;
