/* The API controller
   Exports 3 methods:
   * post - Creates a new thread
   * list - Returns a list of threads
   * show - Displays a thread and its posts
*/
var session = require('express-session');
var express = require('express');
var multer  = require('multer');
var upload = multer({ dest: 'uploads/'});
var fs = require('fs'); /* Appel du module  */
var bodyParser  = require('body-parser');
var expressJWT = require('express-jwt'); 
var jwt = require('jsonwebtoken'); //On va faire appel au module jsonwebtoken pour creer , inscrire , verifié nos tokens
var morgan  = require('morgan');
var config = require('../config'); //On va faire appel à nos configuration présentent dans le fichier config.js
var Post = require('../models/posts.js'); //On va mainteant importer notre modèle pour pouvoir l'utiliser dans notre application (app/models/posts.js)
var Users = require('../models/users.js'); //On va mainteant importer notre modèle pour pouvoir l'utiliser dans notre application (app/models/user.js)
var mySecret = config.secret; /* variable qui fait appel  */




//Gestion des Users//

module.exports = function(app, express) {

  



  app.use(session({
    secret:'%$µ1&&||#',
    saveUninitialized : false,
    resave: false
  }))
  var apiRoutes = express.Router();


  apiRoutes.get('/', function(req, res) {
   res.redirect('/index');
  });

  apiRoutes.get('/index', function(req, res) {
    Post.find({},function(err,posts){
      var data1 = posts.slice (0, 5);
      var data2 = posts.slice (5, 10);
      res.render('index',{
        feedLiveArray1:data1,
        feedLiveArray2:data2});
    })
  });  

  apiRoutes.get('/users', function(req, res) {
    Users.find({}, function(err, users) {
      res.json(users);
    });
   }); 

    apiRoutes.route('/inscription')
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
        if(err)throw err;
        var usersPseudo = Users.findOne({pseudo:req.body.pseudo})
        if(usersPseudo) { //Nous permet de vérifier si un utilisateur existe déjà
            res.render('inscription',{message: 'Un utilisateur avec ce nom d\'utilisateur existe déjà.'});
        } else {
          res.redirect('/dash');
        }
      })
    })

  apiRoutes.post('/authenticate', function(req, res) {
    var query = Users.findOne({pseudo: req.body.pseudo});
    query.select('prenom nom pseudo password');
  // find the user
    query.exec(function(err, user) {
      if (err) throw err;
      if (!user) {
        res.json({ success: false, message: 'Authentication failed. User not found.' });
      } else if (user) {
        // check if password matches
        if (user.password != req.body.password) {
          res.json({ success: false, message: 'Authentication failed. Wrong password.' });
        } else {
          // if user is found and password is right
          // create a token
          var token = jwt.sign({
                  pseudo: user.pseudo,
                  prenom: user.prenom,
                  nom: user.nom,
                  password: user.password
                }, mySecret,
                  { expiresIn: '24h' } //Expire au bout de 24h, une nouvelle authentification sera nécessaire
                );
                req.session.token = token;
                req.session.pseudo = req.body.pseudo;
          // return the information including token as JSON
          res.redirect('/dash');
        }   
      }
    });
  });


apiRoutes.use(function(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.session.token;
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, mySecret, function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
  }
});



apiRoutes.route('/dash')
  .get(function(req, res){
  var query = Users.findOne({pseudo: req.session.pseudo});
  query.select('pseudo srcfile friends');
  query.exec(function(err, user) {
        if(err) {
          res.send(err);
        }
        else {
          res.render('dash',{
          userFriend:user.friends,  
          pseudo:user.pseudo,
          srcfile:user.srcfile,
          friends: user.friends.length,
          scrFileFriend:user.friends
          });
       }
    });
  })
  .post(upload.single('recfile'),function(req,res){
    var tmp_path = req.file.path
    var target_path = 'uploads/' + req.file.originalname;
    var src = fs.createReadStream(tmp_path);
    var dest = fs.createWriteStream(target_path);
    src.pipe(dest);
    var query = Users.findOne({pseudo:req.session.pseudo});
    query.select('pseudo srcfile')
    query.exec(function(err, user) {
     if(err) {
      res.send(err);
     } else {
       var posts = new Post();
       posts.texte = req.body.corpsArticle;
       posts.auteur = user.pseudo;
       posts.date = "";
       posts.srcfile = target_path;
       posts.srcPhotoUser = user.srcfile;
       posts.save(function(err){
        if(err){
        throw err;
        } else {
          res.redirect('/dash');
        }
      })
     }
   });
  })
return apiRoutes;
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
});

/////////////test /////////////


 routeur.route('/')
    .get(function(req,res){
      res.render('index');
    })


  routeur.get('/users', function(req, res) {
    Users.find({}, function(err, users) {
     res.json(users);
    });
  });       

  routeur.route('/index')
    .get(function(req,res){
      res.render('index')
    })
    .post(function(req,res){
      if(!req.body.pseudo){
        res.status(400).send('pseudo required');
        return;
      }
      if(!req.body.password){
        res.status(400).send('password required');
        return;
      }
      Users.findOne({pseudo:req.body.pseudo},function(err,user){
        if(err){
          throw err;
          res.redirect('/')
        } else {
          var myToken = jwt.sign({
          pseudo:req.body.pseudo,
          password:req.body.password
          },mySecret,{ expiresIn: '24h' }); //Expire au bout de 24h, une nouvelle authentification sera nécessaire);
          res.redirect('dash');
          console.log(myToken);
          console.log(user);
        }
      })

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




routeur.route('/dash')
  .get(function(req,res){
    var myToken = req.body.token || req.query.token || req.headers['x-access-token'];
    if(myToken){
      jwt.verify(myToken, mySecret, function(err, decoded) {
        if(err) {
          //On va envoyer une réponse http avec le code 403 (accès refusé) et un message d'erreur
          return res.status(403).send({
            success: false,
            message: 'Echec à authentifier le token'
          });
        } else {//Fin de if(err)
        
          //Si la signature passé en argument est correcte on va pouvoir aller à la prochaine route
          //On va stocker notre payload (les informations) décoder dans la requête pour être utiliser dans les prochaines routes

          req.decoded = decoded;


          //L'utilisateur peut aller plus loin seulement si il fournis un token et que celui ci est vérifié
          Users.findOne({pseudo:req.body.pseudo},function(err,user){
            res.render('dash',user)
          })

        } //Fin du else

      });      
    }
    
  })    










*/


