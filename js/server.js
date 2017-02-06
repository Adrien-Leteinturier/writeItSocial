//var MongoClient = require('mongodb').MongoClient;
//var MongoDb = require('mongodb');
var express = require('express');
var app = express();
//var session = require('express-session');
var cookieParser = require('cookie-parser');
//var URL = 'mongodb://localhost:27017/DiwJs04'

//var fs = require('fs');
var tools = require('./tools');
var mailer = require('nodemailer');
var server = require('http').Server(app);
var colors = require('colors');
//var db = require('../js/db');
var bodyParser = require('body-parser');
var socketIO = require('socket.io');
var io = socketIO(server);
var config = require('./config');
var port = config.port;


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

var mongoose = require('mongoose');
//var app = module.exports = express.createServer();

// connect to Mongo when the app initializes
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/DiwJs04');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});



// set up the RESTful API, handler methods are defined in api.js
var apiRoutes = require('./routes/api.js')(app, express);
app.use('/', apiRoutes);


var countLive = 0;
io.on('connection', function (socket) {
countLive = countLive + 1;

//Compteur connect
  io.emit('usersLiveCount',countLive)
    console.log('a user connected');

    socket.on('disconnect', function () {
      countLive = countLive - 1;
      io.emit('usersLiveCount',countLive)
      console.log('user disconnected');
  });
});


app.listen(port);
console.log('Notre serveur est en écoute sur le port ' + port);
