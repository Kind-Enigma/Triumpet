var express        = require('express');
var mongoose       = require('mongoose');

var app = express();

//Declares Database path and sets default to localhost.
//Please remember to set process.env.dbPath on your deployment environment
var dbPath = process.env.dbPath || 'mongodb://ds045097.mongolab.com:45097/triumpet';

//connect to mongo
mongoose.connect(dbPath, {
  user: "admin",
  pass: "triumpet"
});

mongoose.connection.on('error', function(error){
  console.log("Can't connect to mongoDB.");
  console.log(error);
});

//configure server with all middleware and routing
require('./config/router.js')(app, express);

//export our app required by server.js
module.exports = app;
