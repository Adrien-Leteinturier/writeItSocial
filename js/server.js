//var MongoClient = require('mongodb').MongoClient;
//var MongoDb = require('mongodb');
var express = require('express');
var app = express();
//var session = require('express-session');
//var cookieParser = require('cookie-parser');
//var URL = 'mongodb://localhost:27017/DiwJs04'

//var fs = require('fs');
var tools = require('./tools');
var mailer = require('nodemailer');
//var server = require('http').Server(app);
var colors = require('colors');
//var db = require('../js/db');
var bodyParser = require('body-parser');
//var socketIO = require('socket.io');
//var io = socketIO(server);
var config = require('./config');
var mongoose = require('mongoose');
var port = config.port;
var server = require('http').Server(app);
var socketIO = require('socket.io');
var io = socketIO(server);

//var Post = require('./models/posts.js'); //On va mainteant importer notre modèle pour pouvoir l'utiliser dans notre application (app/models/posts.js)
//var Users = require('./models/users.js'); //On va mainteant importer notre modèle pour pouvoir l'utiliser dans notre application (app/models/user.js)
 

// Main Color debug //  
colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.set('view engine','pug'); // regarde dans un fichier views par default
app.use(express.static("../public"));
app.use(express.static("../public/css"));
app.use(express.static("../public/images"));
app.use(express.static("../js"));
app.use(express.static("../public/uploads"));
app.use(express.static("../public/imagesUi"));
app.use('/node_modules/socket.io/node_modules/socket.io-client/socket.io/', express.static(__dirname + '/node_modules/socket.io/node_modules/socket.io-client'))

// connect to Mongo when the app initializes
//  mongoose.Promise = global.Promise;
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost:27017/DiwJs04');


// set up the RESTful API, handler methods are defined in api.js
var apiRoutes = require('./routes/api.js')(app, express, io, mongoose);
app.use('/', apiRoutes);

//var db = mongoose.connection;







// apply the routes to our application with the prefix /api



server.listen(port);
console.log('Notre serveur est en écoute sur le port ' + port);
