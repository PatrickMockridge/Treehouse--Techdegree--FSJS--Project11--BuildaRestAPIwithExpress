'use strict';
var express = require('express');
var router = express.Router();
var Course = require('../models/courses');
var Review = require('../models/reviews');
var auth = require('../auth.js');
// post review
router.post('/courses/:courseId/reviews', auth, function (req, res, next) {
  // create new review
  var review = new Review(req.body);
  review.user = req.user;
  // find one course with specific course id
  // return only reviews & usersWhoReviewed
  Course.findOne({_id: req.params.courseId}, 'reviews', function (err, course) {
    // if error send to the error handler
    if (err) { return next(err); }
      // else push the new review into Course.reviews
      course.reviews.push(review);
      // make sure the user cannot write another review
      course.save(function (err) {
        // if error pass to error handler
        if (err) { return next(err); }
      });
      // save the review
      review.save(function (err) {
        // if any errors
        if (err) {
          // check for validation errors
          if (err.name === 'ValidationError') {
            return res.status(400).json({
              message: 'Validation Failed', errors: { property: [ { code: 400, message: err.errors.rating.message } ] }
            });
          } else {
            // else send error to error handler
            return next(err);
          }
        }
        // send 201 status
        res.status(201);
        // sets Location header
        res.location('/courses/' + course._id);
        res.end();
      });
  });
});

// DELETE /api/courses/:courseId/reviews/:id 204 - Deletes the specified review and returns no content
router.delete('/courses/:courseId/reviews/:id', auth, function (req, res, next) {
  // create a promise to prevent users who didn't create the review from deleting them
   var reviewAuth = Review.findOne({_id: req.params.id}, function (err, review) {
  //   // if error send to error handler
     if (err) { return next(err); }
     console.log(req.user);
     console.log(review);
       if (req.user._id !== review.user) {
         res.send(401);
         res.end();
         return
       }
   });
  // find specific course that matches course id in url
  // return only reviews & usersWhoReviewed
  reviewAuth.then(Course.findOne({_id: req.params.courseId}, 'reviews', function (err, course) {
    // if error send to error handler
    if (err) { return next(err); }
    // splice out the deleted review from course.reviews array
    course.reviews.splice(course.reviews.indexOf(req.params.id), 1);
    // save the course
    course.save(function (err) {
      // if error send to error handler
      if (err) { return next(err); }
    });
    // send 204 status
    res.status(204);
    res.end();
  })
  );
});


module.exports = router;
