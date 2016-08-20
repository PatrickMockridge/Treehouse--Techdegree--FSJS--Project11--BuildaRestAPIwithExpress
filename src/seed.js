'use strict';
// require mongoose seeder
var seeder = require('mongoose-seeder');
// require seed data
var data = require('./data/data.json');
//seed the seed data
seeder.seed(data).then(function (dbData) {
  console.log('The database is seeded with' + dbData);
}).catch(function (err) {
  if (err) {
    console.log(err);
  }
});
