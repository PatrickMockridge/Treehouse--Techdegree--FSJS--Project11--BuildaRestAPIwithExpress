
'use strict';

var mongoose = require('mongoose');
//define course schema
var CourseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Course must have a title']
  },
  description: {
    type: String,
    required: [true, 'Course must have a description']
  },
  estimatedTime: String,
  materialsNeeded: String,
  steps: [{
    stepNumber: Number,
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }]
});

// pre-save, create step numbers
CourseSchema.pre('save', function(next) {
  var course = this;
  for (var i = 0; i<course.steps.length; i++) {
    course.steps[i].stepNumber = i + 1;
  }
  next();
});



// ensure that course contains at least one step
CourseSchema.path('steps').validate(function (steps) {
  if (!steps) {
    return false;
  } else if (steps.length === 0) {
    return false;
  }
  return true;
}, 'Course must contain at least one step');
// keep the course rating as a virtual in the DB to ensure that it does not get out of sync
// with the reviews which are persisted
CourseSchema.virtual('overallRating').get(function () {
  var total = 0;
  for (var i = 0; i < this.reviews.length; i++) {
    total += this.reviews[i].rating;
  }
  return Math.ceil(total / this.reviews.length);
});
var Course = mongoose.model('Course', CourseSchema);
module.exports = Course;
