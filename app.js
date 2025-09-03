const express = require('express');
const app = express();
const port = 8080;
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const Listing = require('./models/listing');

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then(res => console.log('connected to DB'))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('root is working.');
});

app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});
