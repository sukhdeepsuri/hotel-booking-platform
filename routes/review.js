const express = require('express');
const router = express.Router({ mergeParams: true });

const wrapAsync = require('../utils/wrapAsync');

const Listing = require('../models/listing');
const Review = require('../models/review');

const { listingSchema } = require('../schema.js');
const { reviewSchema } = require('../schema.js');

const validateReview = function (req, res, next) {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error);
  } else {
    next();
  }
};

// Reviews
// Create Route - POST request
router.post(
  '/',
  validateReview,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    const { review } = req.body;

    const newReview = new Review(review);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${id}`);
  })
);

// DELETE request
router.delete('/:reviewId', async (req, res) => {
  const { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });

  await Review.findByIdAndDelete(reviewId);

  res.redirect(`/listings/${id}`);
});

module.exports = router;
