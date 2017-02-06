/* The API controller
   Exports 3 methods:
   * post - Creates a new thread
   * list - Returns a list of threads
   * show - Displays a thread and its posts
*/

var multer  = require('multer');
var upload = multer({ dest: 'uploads/'});
var fs = require('fs'); /* Appel du module  */
var Users = require('../models/users.js'); //On va mainteant importer notre modèle pour pouvoir l'utiliser dans notre application (app/models/user.js)
var Post = require('../models/posts.js');
var jwt = require('jsonwebtoken'); //On va faire appel au module jsonwebtoken
var config = require('../config'); //On va faire appel à nos configuration présentent dans le fichier config.js

var mySecret = config.secret; /* variable qui fait appel */


module.exports = function(app, express) {
  var routeur = express.Router();


  routeur.route('/')
    .get(function(req,res){
      res.render('index');
    })


  routeur.route('/inscription')
    .get(function(req,res){
      res.render('inscription');
    })
    .post(upload.single('recfile'),function(req,res){
      var tmp_path = req.file.path
      var target_path = 'uploads/' + req.file.originalname;
      var src = fs.createReadStream(tmp_path);
      var dest = fs.createWriteStream(target_path);
      src.pipe(dest);
      var users = new Users();
        users.genre = req.body.genre;
        users.age = req.body.age;
        users.prenom = req.body.prenom;
        users.nom = req.body.nom;
        users.pseudo = req.body.pseudo;
        users.password = req.body.password;
        users.email = req.body.email;
        users.srcfile = target_path;
        users.presentation = req.body.present;
        users.friends = [
        {
          pseudo:null,
          srcfile:null
        }]
      users.save(function(err){
        var usersPseudo = Users.findOne({pseudo:users.pseudo})
        if(usersPseudo) { //Nous permet de vérifier si un utilisateur existe déjà
            res.render('inscription',{message: 'Un utilisateur avec ce nom d\'utilisateur existe déjà.'});
        } else {
          res.redirect('dash',users);
        }
      })
    })
return routeur;
};



/*
exports.post = function(req, res) {
  var tmp_path = req.file.path
  var target_path = 'uploads/' + req.file.originalname;
  var src = fs.createReadStream(tmp_path);
  var dest = fs.createWriteStream(target_path);
  src.pipe(dest);
  new Users({
    genre: req.body.genre,
    age: req.body.age,
    prenom: req.body.prenom,
    nom : req.body.nom,
    pseudo: req.body.pseudo,
    password: req.body.password,
    email: req.body.email,
    srcfile:target_path,
    presentation: req.body.present,
    role:2,
    friends:[
     {
      pseudo:null,
      srcfile:null
     }
  ]}).save();
}
*/
exports.list = function(req, res) {
  Users.find(function(err, users) {
    res.send(users);
  });
}

// first locates a thread by title, then locates the replies by thread ID.
exports.show = (function(req, res) {
    Users.findOne({pseudo: req.params.pseudo}, function(error, users) {
      console.log(users)
        //var posts = Post.find({thread: thread._id}, function(error, posts) {
          res.send([{Users: users}]);
        //});
    })
});;

/*
app.post('/inscription',upload.single('recfile'),function(req,res){
  collectionUsers.findOne({pseudo: req.body.pseudo},function(err, result) {
    if(err){
      console.log('error find collection /inscription'.error)
    } else {
      if(result){
        var pseudoExisted = 'Ce pseudo existe deja !';
        res.render('inscription',{pseudoExist:pseudoExisted});
      } else {
        var tmp_path = req.file.path
        var target_path = 'uploads/' + req.file.originalname;
        var src = fs.createReadStream(tmp_path);
        var dest = fs.createWriteStream(target_path);
        src.pipe(dest);
        collectionUsers.insertOne({
          genre: req.body.genre,
          age: req.body.age,
          prenom: req.body.prenom,
          nom : req.body.nom,
          pseudo: req.body.pseudo,
          password: req.body.password,
          email: req.body.email,
          srcfile:target_path,
          presentation: req.body.present,
          role:2,
          friends:[
          {
            pseudo:"",
            srcfile:""
          }
        ]}, function(err, result) { 
          req.session.prenom = req.body.prenom;
          req.session.nom = req.body.nom;
          req.session.pseudo = req.body.pseudo;
          req.session.srcfile = 'uploads/' + req.file.originalname;
          res.redirect('/dash');
        });
      }
    }
  })
});*/