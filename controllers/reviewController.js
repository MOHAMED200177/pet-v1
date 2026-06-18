const Review = require('../modles/reviewModel');
const factory = require('./handlerFactory');

// FIX: previously createReview was just factory.createOne(Review), which
// required the client to know and send the Mongo ObjectIds for `pet` and
// `user`. Now both are derived from the request, matching the nested route
// /api/v1/pets/:petId/reviews and the logged-in user.
exports.setPetUserIds = (req, res, next) => {
  if (!req.body.pet) req.body.pet = req.params.petId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
