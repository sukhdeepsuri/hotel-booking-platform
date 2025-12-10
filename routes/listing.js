const express = require('express');
const router = express.Router();

const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError.js');

const Listing = require('../models/listing');
const Review = require('../models/review');

const { listingSchema } = require('../schema.js');
const { reviewSchema } = require('../schema.js');

const { isLoggedIn, isOwner } = require('../middleware.js');

const multer = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage });

const validateListing = function (req, res, next) {
  const result = listingSchema.validate(req.body);
  if (result.error) {
    throw new ExpressError(400, result.error);
  } else {
    next();
  }
};

// Listings
// Initialize currently logged in user as 'owner' for all the listings.
router.get('/setowner', async (req, res) => {
  const allListings = await Listing.find({});
  for (const listing of allListings) {
    listing.owner = res.locals.currUser._id;
    await listing.save();
  }
  res.send('owner initialized!');
});

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

router.get(
  '/currentlocation',
  wrapAsync(async (req, res) => {
    const { city } = req.query;

    const allListings = await Listing.aggregate([
      {
        $addFields: {
          isPreferredCity: {
            $cond: [{ $eq: ['$location', city] }, 1, 0], // Make sure city is not undefined.
          },
        },
      },

      {
        $sort: { isPreferredCity: -1 },
      },
    ]);

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
    const listing = await Listing.findById(id)
      .populate({ path: 'reviews', populate: { path: 'author' } })
      .populate('owner');

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
  upload.single('listing[image]'),
  validateListing,
  wrapAsync(async (req, res) => {
    const url = req.file.path;

    const listing = new Listing(req.body.listing);
    listing.image = url;
    listing.owner = req.user._id;

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
