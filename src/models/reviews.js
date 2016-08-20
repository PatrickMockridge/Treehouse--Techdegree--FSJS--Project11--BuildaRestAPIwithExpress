
'use strict';

var mongoose = require('mongoose'),
      integerValidator = require('mongoose-integer');

//define review schema
var ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  postedOn: {
    type: Date,
    default: Date.now
  },
  rating: {
    type: Number,
    required: [true, 'Please Enter a Rating'],
    min: 1,
    max: 5,
    default: 3,
    integer: 'Value must be an integer.'
  },
  review: String
});

ReviewSchema.plugin(integerValidator);

var Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;
