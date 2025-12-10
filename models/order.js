const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
  },

  startDate: {
    type: Date,
    required: true,
  },

  endDate: {
    type: Date,
    required: true,
  },

  guests: {
    type: Number,
    required: true,
  },
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
