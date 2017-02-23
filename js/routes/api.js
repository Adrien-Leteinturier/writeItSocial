/* The API controller
   Exports 3 methods:
   * post - Creates a new thread
   * list - Returns a list of threads
   * show - Displays a thread and its posts
*/

var session = require('express-session');
var multer  = require('multer');
var upload = multer({ dest: 'uploads/'});
var fs = require('fs'); /* Appel du module  */
var bodyParser  = require('body-parser');
var expressJWT = require('express-jwt'); 
var jwt = require('jsonwebtoken'); //On va faire appel au module jsonwebtoken pour creer , inscrire , verifié nos tokens
var morgan  = require('morgan');
var mailer = require('nodemailer');
var config = require('../config'); //On va faire appel à nos configuration présentent dans le fichier config.js
var Post = require('../models/posts.js'); //On va mainteant importer notre modèle pour pouvoir l'utiliser dans notre application (app/models/posts.js)
var Users = require('../models/users.js'); //On va mainteant importer notre modèle pour pouvoir l'utiliser dans notre application (app/models/user.js)
var mySecret = config.secret; /* variable qui fait appel  */



var smtpTransport = mailer.createTransport("SMTP",{
  service: "Gmail",
	  auth: {
		  user: "adrienleteinturier@gmail.com",
			pass: "doublem93600$"
					}
});


//Gestion des Users//

module.exports = function(app, express, io, mongoose) {
  var apiRoutes = express.Router();
  
  app.use(session({
    secret:'%$µ1&&||#',
    saveUninitialized : false,
    resave: false
  }))


  apiRoutes.get('/', function(req, res) {
    Post.find({},function(err,posts){
      var data1 = posts.slice (0, 5);
      var data2 = posts.slice (5, 10);
      res.render('index',{
        feedLiveArray1:data1,
        feedLiveArray2:data2});
    })
  });  


  apiRoutes.route('/mdpLost')
    .get(function(req,res){
      res.render('mdpLost');
    })
    .post(function(req,res){
      Users.findOne({email:req.body.email},function(err,user){
        if(err){
          throw err;
          res.render('mdpLost',{message:'Votre profil est inconnu'});
        } else {
          var mailMdpLost = {
            from: "WriteItSocial@gmail.com",
              to: user.email,
                subject: "Votre mot de passe",
                html: "<div><div style='background-color:#333856;color:white;text-align:center;padding:16px;'><h1>Bonjour " + user.pseudo + "</h1><br><h4>Suite à votre demande de mot de passe oublié</h4><p>Voici votre mot de passe : </p><h4>" + user.password + "</h4></div>"
          }
          smtpTransport.sendMail(mailMdpLost, function(error, response){
            if(error){
              console.log("Erreur lors de l'envoie du mail!".error);
              console.log(error.error);
            } else {
              console.log("Mail envoyé avec succès!".info)
            }
            smtpTransport.close();
          });   
          res.redirect('/');                  
        }
      })
    })


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
        if(err) {
          if(err.code == 11000) { //Nous permet de vérifier si un utilisateur existe déjà
            return res.render('inscription' ,{success: false, message: 'Un utilisateur avec ce pseudo d\'utilisateur existe déjà.'});
          } else {
            return res.send(err);
          }
        } else {
          res.redirect('/');
        }
      })
    })



    
  apiRoutes.post('/authenticate', function(req, res) {
    Users.findOne({pseudo: req.body.pseudo},function(err,user){
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
  Users.findOne({pseudo: req.session.pseudo},function(err,user){
        if(err) {
          res.send(err);
        }
        else {
          res.render('dash',{
          userFriend:user.friends,  
          pseudo:user.pseudo,
          srcfile:user.srcfile,
          friends: user.friends.length
          });
       }
    });
  })
  .post(upload.single('file'),function(req,res){
    var date = new Date();
    var datePost = date.toLocaleString(); 
    var tmp_path = req.file.path;
    var target_path = 'uploads/' + req.file.originalname;
    var src = fs.createReadStream(tmp_path);
    var dest = fs.createWriteStream(target_path);
    src.pipe(dest);
    Users.findOne({pseudo:req.session.pseudo},function(err,user){
     if(err) {
      res.send(err);
     } else {
       var posts = new Post();
       posts.texte = req.body.textPost;
       posts.auteur = user.pseudo;
       posts.date = datePost;
       posts.srcfile = target_path;
       posts.srcPhotoUser = user.srcfile;
       posts.save(function(err){
        if(err){
        throw err;
        } else {
        Post.find({}).sort([['date', -1]]).exec(function(err, docs) {
          io.emit('allPostDisplay',docs);
        });
        }
      })
     }
   });
  })



apiRoutes.route('/mydash')
  .get(function(req, res){
  Users.findOne({pseudo: req.session.pseudo},function(err,user){
    if(err){
      throw err
    } else {
      Post.find({auteur: user.pseudo},function(err,post){
        if(err) {
          res.send(err)
        } else {
        console.log('postdash' + post._id)
          res.render('mydash',{
            userFriend:user.friends,  
            pseudo:user.pseudo,
            srcfile:user.srcfile,
            friends: user.friends.length,
            scrFileFriend:user.friends,
            allPostUser:post
          });
        }
      });  
    }
  });
})

apiRoutes.route('/post/:_id')
  .get(function(req,res){
    Post.findById(req.params._id, function(err,post) {
      if(err) {
        throw err;
      } else {
        post.remove({});
        res.redirect('/mydash');
      }
    })
  })
  .post(upload.single('recfile'),function(req,res){
    Post.findById(req.params._id, function(err,posts){
      if(err){
        throw err;
      } else {
       var date = new Date();
       var datePost = date.toLocaleString(); 
       var tmp_path = req.file.path
       console.log(tmp_path);
       var target_path = 'uploads/' + req.body.image;
       var src = fs.createReadStream(tmp_path);
       var dest = fs.createWriteStream(target_path);        
       posts.texte = req.body.textPost;
       posts.auteur = req.session.pseudo;
       posts.srcfile = target_path;
       posts.date = datePost;
       posts.save(function(err) {
        if(err) {
          throw err;
        } else {
          res.redirect('/mydash');
        }
      })//user.save       
     }
    })
  })
//////ddfdfd///////
apiRoutes.route('/comments/:_id')
  .post(function(req,res){
    Users.findOne({pseudo:req.session.pseudo},function(err,user){
      if(err){
        throw err;
      } else {
        var date = new Date();
        var datePost = date.toLocaleString();
        console.log(req.params._id);
        Post.findByIdAndUpdate(
        req.params._id,
        {$push: {comments: {
          auteur : req.session.pseudo,
          texte : req.body.textComment,
          date : datePost,
          srcPhotoUser : user.srcfile
        }}},
        {safe: true, upsert: true, new : true},
        function(err, model) {
          if(err){
          console.log(err);
          }
        }
        );   
        res.redirect('/dash'); 
      }
    }) 
  })
  
  /*
apiRoutes.route('/comments/:_id')
  .post(function(req,res){
    Users.findOne({pseudo:req.session.pseudo},function(err,user){
          var date = new Date();
          var datePost = date.toLocaleString();
          Post.findByIdAndUpdate(
          req.params._id,
          {$push: {comments: [{
            auteur : req.session.pseudo,
            texte : req.body.textComment,
            date : datePost,
            srcPhotoUser : user.srcfile
          }]}},
          {safe: true, upsert: true, new : true},
          function(err, model) {
              console.log(err);
          }
          );    
    }) 
  })*/

  apiRoutes.route('/profil')
    .get(function(req,res){
      Users.findOne({pseudo: req.session.pseudo},function(err,user){
        if(err){
          throw err;
        } else {
          res.render('profil',{
            genre:user.genre,
            age:user.age,
            prenom:user.prenom, 
            nom:user.nom, 
            pseudo:req.session.pseudo, 
            password:user.password, 
            email:user.email,
            presentation: user.presentation, 
            srcfile: user.srcfile,
            friends: user.friends.length,
            scrFileFriend:user.friends,
            postAll: user
          });          
        }
      });      
    })
    .post(function(req,res){
      Users.findOne({pseudo: req.session.pseudo}, function(err,user){
        if(err){
          throw err;
        } else {
          user.age = req.body.age;
          user.prenom = req.body.prenom;
          user.nom = req.body.nom;
          user.pseudo = req.body.pseudo;
          user.password = req.body.password;
          user.email = req.body.email;
          //user.srcfile = target_path;
          user.presentation = req.body.present;
          user.save(function(err) {
            if(err) {
              throw err;
            } else {
              res.redirect('/profil');
            }
          })//user.save       
        }
      })
    })

  apiRoutes.route('/profilPublic/:_id')
  .get(function(req,res){
    Users.findOne({pseudo: req.session.pseudo},function(err,user){
    if(err){
      throw err;
    } else {
      Users.findById(req.params._id,function(err,userPublic){
        console.log('icici' + userPublic);
        Post.find({auteur:userPublic.pseudo},function(err,userPostPublic){
            if(err) {
              throw err;
            } else {
              res.render('profilPublic',{
              userFriend:user.friends,  
              pseudo:user.pseudo,
              srcfile:user.srcfile,
              friends: user.friends.length,
              userPublicId : userPublic._id,
              userPublicSrcFile : userPublic.srcfile,
              userPublicPseudo : userPublic.pseudo,
              userPublicPresent : userPublic.presentation,
              userPublicCountFriends : userPublic.friends.length,
              userPubliCountPost : userPostPublic.length
              });
            }
          });
        });
      }
    })
  })
  .post(function(req,res){
    Users.findById(req.params._id,function(err,userPublicInvite){
          var mailMdpLost = {
            from: "WriteItSocial@gmail.com",
              to: userPublicInvite.email,
                subject: "Vous avez reçu une invitation de la part de " + " " + req.session.pseudo,
                html: "<img src='http://localhost:8080/images/logo-footer.png'/><div class='contentMail'><p>Bonjour</p><h2 style='color:'#265A88'> " + userPublicInvite.pseudo + "</h2><br><h2>Vous avez reçu une invitation de la part de "+ "<br>" + req.session.pseudo +"</h2><br><a href='http://localhost:8080/validInvite/"+ userPublicInvite._id + "'>Pour accepter l'invitation - Cliquez ICI</a></div>"
          }
          smtpTransport.sendMail(mailMdpLost, function(error, response){
            if(error){
              console.log("Erreur lors de l'envoie du mail!".error + error);
              console.log(error.error);
            } else {
              console.log("Mail envoyé avec succès!".info)
            }
            smtpTransport.close();
          });
          res.redirect('/dash');         
    })  
  })

  apiRoutes.route('/validInvite/:_id')

  apiRoutes.route('/deleteProfil/:_id')
    .get(function(req,res){
      Users.findById(req.params._id, function(err,user) {
        if(err) {
          throw err;
        } else {
          user.remove({});
          res.redirect('/');
        }
      })
    })









/*
  app.get('/profil',function(req,res){
  var pseudo = req.session.pseudo;
  if(req.session.pseudo){
    collectionPost_its.find({auteur:pseudo}).sort({date : -1}).toArray(function(err, data) {
      collectionUsers.find({pseudo:pseudo},{
       
        _id:1,
        genre:1,
        age:1,
        prenom:1,
        nom:1,
        pseudo:1,
        password:1,
        email:1,
        srcfile:1,
        presentation:1,
        friends:1

      }).toArray(function(err, result) {
        console.log(result[0].srcfile)

        res.render('profil',{
          genre:result[0].genre,
          age:result[0].age,
          prenom:result[0].prenom, 
          nom:result[0].nom, 
          pseudo:pseudo, 
          password:result[0].password, 
          email:result[0].email,
          presentation: result[0].presentation, 
          srcfile: result[0].srcfile,
          friends: result[0].friends.length,
          scrFileFriend:result[0].friends,
          postAll: data
          });
      });
    });

        } else {
          var pseudo = '';
          res.redirect('/');
        }
});
*/

  // Compteur live Server //
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
  //Compteur number log
        Users.find({}).count(function(err,result){
          if(err){
            console.log('error find Users for count error')

          } else if(result){
            io.emit('usersCountLog', result);
          }
        });
  //Compteur post
        Post.find({}).count(function(err,result){
          if(err){
            console.log('error find PostIts for count error')

          } else if(result){
            io.emit('postItsCountLog', result);
          }
        });

  // Compteur live Server ends //  

  // all post affichage // 
        Post.find({}).sort([['date', -1]]).exec(function(err, docs) {
          io.emit('allPostDisplay',docs);
        });
  // all post affichage ends // 



  // search bar // 

    socket.on( 'searchBar', function ( search ) { // quand je recoi des infos en socket , a chaque fois que quelqun tape une nouvelle lettre dans la bar de recherche du header
      console.log('valeur de search bar ' + search);
      Users.find( { pseudo: { $regex: '^'+search, $options: 'i' } } ).sort( { pseudo: 1 } ).exec( function ( err, data ) { // je cherche tous les pseudo qui contien c lettre et je les tries
        if ( err ) {
          console.log('error search');
        } else {
          console.log(data);
          socket.emit( 'returnSearch', { users : data } )  // je renvoye tous les resultat a l utilisateurs en direct grace socket.io
        }
      });
    });
  // search bar ends //
  });


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


