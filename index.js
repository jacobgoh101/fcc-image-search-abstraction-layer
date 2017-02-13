const ImagesClient = require('google-images');
const express = require('express');
const mongodb = require('mongodb');
const async = require('async');
const helmet = require('helmet');

let imagesClient = new ImagesClient('011656522313889263409:jfejwn3fubo', 'AIzaSyCtvMSBtBTjhl42ZRfCGtZL7epjqedBFn8');

const MongoClient = mongodb.MongoClient;
const dbName = "img-search-api";
const dbUrl = process.env.MONGOLAB_URI ? process.env.MONGOLAB_URI + dbName : "mongodb://localhost:27017/" + dbName; //"mongodb://jacob:jacob123@ds151289.mlab.com:51289/fcc-img-search-api";
console.log('dbUrl: ' + dbUrl);
const baseUrl = process.env.BASE_URL || 'http://localhost:8080';

const app = express();
app.use(helmet());

app.get("/api/imagesearch/:searchStr", (req,res) => {
  res.setHeader("Content-Type", "application/json");

  let searchStr = req.params.searchStr;
  let offset = req.query.offset;

  // log search into db
  MongoClient.connect(dbUrl, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      console.log('Connection established to', dbUrl);
    }

    const collection = db.collection('img-search-api');

    collection.insertMany([
      {
        term: searchStr,
        when: new Date().toISOString()
      }
    ],(err,results) => {
      if(err) callback(err);

      db.close();
    })

    db.close();
  });

  imagesClient.search(searchStr, {
    page: offset
  }).then(function (images) {
    let results = images.map((obj) => {
      return {
        url: obj.url,
        thumbnail: obj.thumbnail.url,
        size: obj.size + ' bytes',
        type: obj.type
      }
    });
    res.json(results);
  });
});

app.get("/api/latest/imagesearch", (req,res) => {
  res.setHeader("Content-Type", "application/json");

  MongoClient.connect(dbUrl, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      console.log('Connection established to', dbUrl);
    }

    const collection = db.collection('img-search-api');

    collection.find({}, {
      _id: 0
    }).sort({
      when: -1
    }).toArray((err,docs) => {
      if(err) throw err;
      res.json(docs);
    })

    db.close();
  });
});

app.get("/", (req,res) => {
  res.setHeader("Content-Type", "application/json");
  res.json({
    Name: "FCC Image Search Abstraction Layer",
    Example: {
      search: baseUrl + "/api/imagesearch/blue%20car?offset=1",
      listSearchHistory: baseUrl + "/api/latest/imagesearch"
    }
  })
});

const port = process.env.PORT || 8080;
app.listen(port);
