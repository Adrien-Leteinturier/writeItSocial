var express = require('express');
var app = express();
var mailer = require('nodemailer');
var colors = require('colors');
var bodyParser = require('body-parser');
var config = require('./config');
var mongoose = require('mongoose');
var port = config.port;
var server = require('http').Server(app);
var socketIO = require('socket.io');
var io = socketIO(server);
 

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

//  mongoose.Promise = global.Promise;
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost:27017/DiwJs04');

var apiRoutes = require('./routes/api.js')(app, express, io, mongoose);
app.use('/', apiRoutes);

server.listen(port);
console.log('Notre serveur est en écoute sur le port ' + port);
