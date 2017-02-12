const ImagesClient = require('google-images');
const express = require('express');
const async = require('async');

let imagesClient = new ImagesClient('011656522313889263409:jfejwn3fubo', 'AIzaSyCtvMSBtBTjhl42ZRfCGtZL7epjqedBFn8');



const app = express();

app.get("/api/imagesearch/:searchStr", (req,res) => {
  let searchStr = req.params.searchStr;
  let offset = req.query.offset;
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

const port = process.env.PORT || 8080;
app.listen(port);
