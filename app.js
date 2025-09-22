const express = require('express');
const app = express();
const port = 8080;
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');

const listings = require('./routes/listing.js');
const reviews = require('./routes/review.js');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, '/public')));
app.engine('ejs', ejsMate);

app.use(
  session({
    secret: 'secretcode',
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
  })
);

app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Mongoose Connection
const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then(res => console.log('connected to DB'))
  .catch(err => console.log(err));

app.use('/listings', listings);
app.use('/listings/:id/reviews', reviews);

app.get('/', (req, res) => {
  res.redirect('/listings');
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

app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});
