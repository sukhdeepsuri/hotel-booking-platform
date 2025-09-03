const express = require('express');
const app = express();
const port = 8080;
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

app.get('/', (req, res) => {
  res.send('root is working.');
});

app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});
