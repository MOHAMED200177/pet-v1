const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    // FIX: a review needs to know which pet it belongs to so it can be
    // listed via GET /api/v1/pets/:petId/reviews (mergeParams).
    pet: {
      type: mongoose.Schema.ObjectId,
      ref: 'Pet',
      required: [true, 'Review must belong to a pet']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'Customer',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
