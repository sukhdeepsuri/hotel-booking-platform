const express = require('express');
const router = express.Router({ mergeParams: true });
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware');

const User = require('../models/user');
const Listing = require('../models/listing');
const Order = require('../models/order');

router.get('/signup', (req, res) => {
  res.render('users/signup.ejs');
});

router.get('/login', (req, res) => {
  res.render('users/login.ejs');
});

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, err => {
      if (err) {
        return next(err);
      }
    });

    req.flash('success', 'User Registered Successfully!');
    res.redirect('/listings');
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/user/signup');
  }
});

router.post('/login', saveRedirectUrl, passport.authenticate('local', { failureRedirect: '/user/login', failureFlash: true }), async (req, res) => {
  req.flash('success', 'Welcome back to Wanderlust!');
  const redirectUrl = res.locals.redirectUrl || '/listings';
  res.redirect(redirectUrl);
});

router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }
  });

  req.flash('success', 'User logged out!');
  res.redirect('/listings');
});

router.get('/orders', async (req, res) => {
  const user = await User.findById(res.locals.currUser._id).populate({ path: 'orders', populate: { path: 'listing' } });

  if (user.orders.length) {
    res.render('users/orders.ejs', { orders: user.orders });
  } else {
    req.flash('error', 'No orders found for you!');
    res.redirect('/listings');
  }
});

router.get('/orders/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId).populate('listing');
  res.render('users/order.ejs', { order });
});

router.post('/orders/:id', async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  const { startDate, endDate, guests } = req.body.order;

  const user = res.locals.currUser;

  const order = {
    listing: listing,
    startDate: startDate,
    endDate: endDate,
    guests: guests,
  };

  const newOrder = new Order(order);
  await newOrder.save(); // First, it creates this new document in orders collection.

  user.orders.push(newOrder); // Then, it pushes the reference of this newOrder to user.orders[] array.
  await user.save();

  listing.isAvailable = false;
  await listing.save();

  req.flash('success', 'Congratulations! Your new hotel is booked!');
  res.redirect('/user/orders');
});

module.exports = router;
