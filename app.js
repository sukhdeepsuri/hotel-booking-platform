const express = require('express');
const app = express();
const port = 8080;
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require('./utils/ExpressError');
const { listingSchema } = require('./schema.js');
const { reviewSchema } = require('./schema.js');

const Listing = require('./models/listing');
const Review = require('./models/review');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, '/public')));
app.engine('ejs', ejsMate);

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then(res => console.log('connected to DB'))
  .catch(err => console.log(err));

const validateListing = function (req, res, next) {
  const result = listingSchema.validate(req.body);
  if (result.error) {
    throw new ExpressError(400, result.error);
  } else {
    next();
  }
};

const validateReview = function (req, res, next) {
  const { error } = reviewSchema.validate(req.body.review);
  if (error) {
    throw new ExpressError(400, error);
  } else {
    next();
  }
};

// Index Route
app.get('/listings', async (req, res) => {
  const allListings = await Listing.find({});
  res.render('listings/index.ejs', { allListings });
});

// New Route
app.get('/listings/new', (req, res) => {
  res.render('listings/new.ejs');
});

// Show Route
app.get(
  '/listings/:id',
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate('reviews');
    if (!listing) throw new ExpressError(404, 'Listing not found');
    else res.render('listings/show.ejs', { listing });
  })
);

// Edit Route
app.get(
  '/listings/:id/edit',
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) throw new ExpressError(404, 'Listing not found');
    else res.render('listings/edit.ejs', { listing });
  })
);

// Create Route - POST request
app.post(
  '/listings',
  validateListing,
  wrapAsync(async (req, res) => {
    const listing = new Listing(req.body.listing);
    await listing.save();
    res.redirect('/listings');
  })
);

app.post(
  '/listings/:id/reviews',
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

// Edit Route - PUT request
app.put(
  '/listings/:id',
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = req.body.listing;
    await Listing.findByIdAndUpdate(id, {
      ...listing,
    });
    res.redirect(`/listings/${id}`);
  })
);

// DELETE request
app.delete(
  '/listings/:id',
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect('/listings');
  })
);

app.delete('/listings/:id/reviews/:reviewId', async (req, res) => {
  const { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });

  await Review.findByIdAndDelete(reviewId);

  res.redirect(`/listings/${id}`);
});

// Fallback Middleware
app.use((req, res, next) => {
  next(new ExpressError(404, 'Page not found'));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const { status = 500, message } = err;
  res.status(status).render('error.ejs', { message });
});

app.get('/', (req, res) => {
  res.send('root is working.');
});

app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});
