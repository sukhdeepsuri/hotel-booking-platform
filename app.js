const express = require('express');
const app = express();
const port = 8080;
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const Listing = require('./models/listing');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, '/public')));

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then(res => console.log('connected to DB'))
  .catch(err => console.log(err));

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
app.get('/listings/:id', async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render('listings/show.ejs', { listing });
});

// Edit Route
app.get('/listings/:id/edit', async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render('listings/edit.ejs', { listing });
});

// Create Route - POST request
app.post('/listings', async (req, res) => {
  const listing = new Listing(req.body.listing);
  await listing.save();
  res.redirect('/listings');
});

// Edit Route - PUT request
app.put('/listings/:id', async (req, res) => {
  const { id } = req.params;
  const listing = req.body.listing;
  await Listing.findByIdAndUpdate(id, {
    ...listing,
  });
  res.redirect(`/listings/${id}`);
});

// DELETE request
app.delete('/listings/:id', async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect('/listings');
});

app.get('/', (req, res) => {
  res.send('root is working.');
});

app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});
