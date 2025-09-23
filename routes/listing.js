const express = require('express');
const router = express.Router();

const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError.js');

const Listing = require('../models/listing');
const Review = require('../models/review');

const { listingSchema } = require('../schema.js');
const { reviewSchema } = require('../schema.js');

const { isLoggedIn, isOwner } = require('../middleware.js');

const validateListing = function (req, res, next) {
  const result = listingSchema.validate(req.body);
  if (result.error) {
    throw new ExpressError(400, result.error);
  } else {
    next();
  }
};

// Listings
// Index Route
router.get('/', async (req, res) => {
  const allListings = await Listing.find({});
  res.render('listings/index.ejs', { allListings });
});

router.get(
  '/lowToHigh',
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({}).sort({ price: 1 });
    res.render('listings/index.ejs', { allListings });
  })
);

router.get(
  '/highToLow',
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({}).sort({ price: -1 });
    res.render('listings/index.ejs', { allListings });
  })
);

// New Route
router.get('/new', isLoggedIn, (req, res) => {
  res.render('listings/new.ejs');
});

// Show Route
router.get(
  '/:id',
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate('reviews').populate('owner');
    if (!listing) {
      req.flash('error', 'Listing you requested for does not exist.');
      res.redirect('/listings');
      // throw new ExpressError(404, 'Listing not found!');
    } else res.render('listings/show.ejs', { listing });
  })
);

// Edit Route
router.get(
  '/:id/edit',
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash('error', 'Listing you requested for does not exist.');
      res.redirect('/listings');
      // throw new ExpressError(404, 'Listing not found!');
    } else res.render('listings/edit.ejs', { listing });
  })
);

// Create Route - POST request
router.post(
  '/',
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res) => {
    const listing = new Listing(req.body.listing);
    await listing.save();
    req.flash('success', 'New Listing Created!');
    res.redirect('/listings');
  })
);

// Update Route - PUT request
router.put(
  '/:id',
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    await Listing.findByIdAndUpdate(id, {
      ...req.body.listing,
    });

    req.flash('success', 'Listing Updated Successfully');
    res.redirect(`/listings/${id}`);
  })
);

// DELETE request
router.delete(
  '/:id',
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);

    req.flash('success', 'Listing Deleted Successfully');
    res.redirect('/listings');
  })
);

module.exports = router;
