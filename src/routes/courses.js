'use strict';
// require express
var express = require('express');
// create router
var router = express.Router();
// require course model
var Course = require('../models/courses');
// require user model
var User = require('../models/users');
// require auth
var auth = require('../auth.js');
// sets up universal middleware for all course requests to go through
router.param('id', function (req, res, next, id) {
// finds courses and populates with associated reviews
Course.findById(id).populate('reviews').exec(function (err, course) {
  // handles errors
    if (err) { return next(err); }
    // if course not found
    if (!course) {
      return next(new Error('Course does not exist'));
    }
    // assigns the request to the course populated with reviews
    req.course = course;
    return next();
  });
});

// gets all courses
router.get('/courses', function (req, res, next) {
  // returns _id title and reviews
  Course.find({}, '_id title', function (err, courses) {
    if (err) return next(err);
    //formats data to be consumed by the Angular app
    var allCourses = {};
    allCourses.data = courses;
    // send json response
    res.json(allCourses);
  });
});

// gets course by ID
router.get('/courses/:id', function (req, res, next) {
  // creates options array for paths to populate
  var queryParams = [
    { path: 'reviews.user' },
    { path: 'user' }
  ];
  User.populate(req.course, queryParams, function (err, course) {
    if (err) {
      return next(err);
    }
    // formats data to be consumed by Angular
    var thisCourse = {};
    thisCourse.data = [];
    thisCourse.data.push(course);
    res.json(thisCourse);
  });

});

router.post('/courses', auth, function (req, res, next) {
  // create new Course using req.body
  var course = new Course(req.body);
  // push current user to usersWhoReviewed so user cannot review their own course
  // save the course
  course.save(function (err) {
    // if errors
    if (err) {
      var errorMessages = {
        message: 'Validation Failed',
        errors: {}
      };
      // handle validation errors
        if (err.name === 'ValidationError') {
          for (var error in err.errors) {
            errorMessages.errors[error] = [{
              code: 400,
              message: err.errors[error].message
            }];
          }
          console.log(errorMessages);
          return res.status(400).json(errorMessages);
        } else {
          // else send error to error handler
          return next(err);
    }
  }
    res.status(201);
    // sets Location header
    res.location('/courses/' + course._id);
    res.end();
  });
});


router.put('/courses/:id', auth, function (req, res, next) {
  for (var i = 0; i<req.body.steps.length; i++) {
    req.body.steps[i].stepNumber = i + 1;
  }
  req.course.update(req.body, { runValidators: true }, function (err, course) {
    console.log(req.body);
    // if the user is not the one who made the course
    if (req.user._id != req.body.user._id) {
      //unauthorised
      res.send(401);
      res.end();
    };
    // if error
    if (err) {
      var errorMessages = {
        message: 'Validation Failed',
        errors: {}
      };
      // handle validation errors
        if (err.name === 'ValidationError') {
          for (var error in err.errors) {
            errorMessages.errors[error] = [{
              code: 400,
              message: err.errors[error].message
            }];
          }
          console.log(errorMessages);
          return res.status(400).json(errorMessages);
        } else {
          // else send error to error handler
          return next(err);
    }
  }
    // send 204 status
    res.status(204);
    res.end();
  });
});
module.exports = router;
