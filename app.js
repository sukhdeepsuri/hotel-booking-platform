if (process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const port = 8080;
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

const listingRouter = require('./routes/listing.js');
const reviewRouter = require('./routes/review.js');
const userRouter = require('./routes/user.js');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, '/public')));
app.engine('ejs', ejsMate);

const store = MongoStore.create({
  mongoUrl: 'mongodb+srv://sukhdeepsuri:uRvOc5xNvcO33H1n@cluster0.6m0ul.mongodb.net/?appName=Cluster0',
  crypto: {
    secret: 'secretcode',
  },
  touchAfter: 24 * 3600,
});

app.use(
  session({
    store,
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

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currUser = req.user;
  next();
});

// Mongoose Connection
// const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
const MONGO_URL = 'mongodb+srv://sukhdeepsuri:uRvOc5xNvcO33H1n@cluster0.6m0ul.mongodb.net/?appName=Cluster0';
async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then(res => console.log('connected to DB'))
  .catch(err => console.log(err));

// Routes
app.use('/listings', listingRouter);
app.use('/listings/:id/reviews', reviewRouter);
app.use('/user', userRouter);

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
