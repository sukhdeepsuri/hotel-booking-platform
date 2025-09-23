const mongoose = require('mongoose');
const Review = require('./review');

const listingSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: String,

  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    set: v => (v == '' ? 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' : v),
  },

  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

listingSchema.post('findOneAndDelete', async listing => {
  await Review.deleteMany({
    _id: { $in: listing.reviews },
  });
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;
