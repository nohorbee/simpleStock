require('dotenv').config()
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
let port = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({extended: true}));

require('./app/data')(app, {});


app.listen(port, () => {
  console.log('We are live on' + port);
});
