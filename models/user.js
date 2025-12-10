const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const Order = require('./order');

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },

  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  ],
});

userSchema.plugin(passportLocalMongoose);
userSchema.post('findOneAndDelete', async user => {
  await Order.deleteMany({
    _id: { $in: user.orders },
  });
});

const User = mongoose.model('User', userSchema);

module.exports = User;
