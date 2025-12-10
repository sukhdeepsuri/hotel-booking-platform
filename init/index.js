const mongoose = require('mongoose');
const Listing = require('../models/listing.js');
// const data = require('./data.js');
let data = require('./data1.js');

// const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
const MONGO_URL = 'mongodb+srv://sukhdeepsuri:uRvOc5xNvcO33H1n@cluster0.6m0ul.mongodb.net/?appName=Cluster0';

async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then(res => console.log('connected to DB'))
  .catch(err => console.log(err));

const initDB = async function () {
  await Listing.deleteMany({});
  data = data.map(obj => {
    return { ...obj, owner: '6939a7e1c68f882df3ac327a' };
  });
  await Listing.insertMany(data);
  console.log('data was initialized.');
};

initDB();
