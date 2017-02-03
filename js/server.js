var MongoClient = require('mongodb').MongoClient;
var MongoDb = require('mongodb');
var express = require('express');
var app = express();
var session = require('express-session');
var cookieParser = require('cookie-parser');
var URL = 'mongodb://localhost:27017/DiwJs04'
var multer  = require('multer');
var upload = multer({ dest: 'uploads/'});
var fs = require('fs');
var tools = require('./tools');
var mailer = require('nodemailer');
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var colors = require('colors');
var db = require('../js/db');
var bodyParser = require('body-parser');
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

app.set('view engine','pug'); // regarde dans un fichier views par default
app.use(express.static("../css"));
app.use(express.static("../images"));
app.use(express.static("../js"));
app.use(express.static("../uploads"));
app.use(express.static("../imagesUi"));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use('node_modules/socket.io/node_modules/socket.io-client/socket.io/', express.static(__dirname + '/node_modules/socket.io/node_modules/socket.io-client'))

//Node mailer//

var smtpTransport = mailer.createTransport("SMTP",{
  service: "Gmail",
	  auth: {
		  user: "adrienleteinturier@gmail.com",
			pass: "Doublemchacha60$"
					}
});



//Gestion des Users//
app.use(session({
    secret:'%$µ1&&||#',
    saveUninitialized : false,
    resave: false
}));



app.get('/',function(req,res){
  res.redirect('index');
});
app.get('/mdpLost',function(req,res){
  res.render('mdpLost');
});
app.get('/deconnection',function(req,res){
	req.session.destroy(function(err) {
		res.redirect('/');
	})
});
app.get('/inscription',function(req,res){
  res.render('inscription');
});




MongoClient.connect(URL, function(err,db){

var collectionUsers = db.collection('users');
var collectionPost_its = db.collection('post_its');  
var collectionComments = db.collection('comments');
var countLive = 0;
var date = new Date();
var theDate = date.toLocaleString();  
var type = upload.single('recfile');


/* HOME PAGE */
app.get('/index', function (req,res) {
  collectionPost_its.find({}).sort({date : -1}).limit(10).toArray(function(err, data) {
    if(err){
      console.log('error find collection /index'.error)
    } else {
      var data1 = data.slice (0, 5);
      var data2 = data.slice (5, 10);
      res.render('index',{
        feedLiveArray1:data1,
        feedLiveArray2:data2});
      if(req.session.pseudo){
        res.redirect('dash');
      }
    }
  });
});


/* CONNEXION */
app.post('/connexion',function(req,res){
  collectionUsers.findOne({
    pseudo: req.body.pseudo,
    password: req.body.password
  }, function(err, result) {
    if(err){
      console.log('error find collection /connexion'.error)
    } else {
      if(result){
        req.session.pseudo = req.body.pseudo;
        res.redirect('/dash');
      } else {
        res.redirect('/');
      }
    }
  });
});

/* INSCRIPTION */
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


/* MOT DE PASSE OUBLIER */
app.post('/mdpRecup',function(req,res){
  collectionUsers.find(
    {email:req.body.email},
    {_id:0,
      pseudo:1,
      password:1,
      email:1
    }).toArray(function(err, result){
    if(result){
      var mailMdpLost = {
        from: "WriteItSocial@gmail.com",
          to: result[0].email,
            subject: "Votre mot de passe",
            html: "<div><div style='background-color:#333856;color:white;text-align:center;padding:16px;'><h1>Bonjour " + result[0].pseudo + "</h1><br><h4>Suite à votre demande de mot de passe oublié</h4><p>Voici votre mot de passe : </p><h4>" + result[0].password + "</h4></div>"
      }
      smtpTransport.sendMail(mailMdpLost, function(error, response){
        if(error){
          console.log("Erreur lors de l'envoie du mail!".error);
          console.log(error.error);
        }else{
          console.log("Mail envoyé avec succès!".info)
        }
        smtpTransport.close();
      }); 
      res.redirect('index');
    } else {
      res.redirect('mdpRecup');
    }
  });
});

app.post('/creation',type,function(req,res){
  var pseudo = req.session.pseudo;
    if(pseudo){
      var tmp_path = req.file.path;
      var target_path = 'uploads/' + req.file.originalname;
      var src = fs.createReadStream(tmp_path);
      var dest = fs.createWriteStream(target_path);
      src.pipe(dest);
      var photoUser = req.session.srcfile;

      collectionUsers.find({pseudo:pseudo},
      {
        _id:0,
        srcfile:1
      }).toArray(function(err, result) {
        if(err){
          console.log('error find Users /creation'.error)
        }

        collectionPost_its.insertOne(
          {
            texte:req.body.corpsArticle,
            auteur:pseudo,
            date:theDate,
            srcfile:target_path,urlPhoto:req.body.url,
            srcPhotoUser:result[0].srcfile
          }, function(err, result) {
            if(err){
              console.log('error Insert collection Users /creation'.error)
            } else {
              res.redirect('/dash');
            }
          });
        });
      } else {
        res.redirect('/');
      } 
});

/* DASHBOARD */
app.get('/dash', function (req,res) {
  var pseudo = req.session.pseudo;
  collectionUsers.find({pseudo:pseudo},{
    _id:0,
    srcfile:1,
    friends:1
  }).toArray(function(err, resultSessionUser) {
    if(err){
      console.log('error find collection /dash'.error)
    } else {
      if(pseudo){
      res.render('dash',
        {
          pseudo:pseudo,
          srcfile:resultSessionUser[0].srcfile,
          friends: resultSessionUser[0].friends.length,
          scrFileFriend:resultSessionUser[0].friends
        });
      } else {
      res.redirect('/');
      }
    }
  });
});

/* DASHBOARD USERS */
app.get('/mydash',function(req,res){
  var pseudo = req.session.pseudo;
  collectionUsers.find({pseudo:pseudo},{
    _id:0,
    srcfile:1,
    friends:1
  }).toArray(function(err, resultSessionUser) {
    if(err){
      console.log('error find collection Users /myDash'.error)
    } else {
      collectionPost_its.find(
        {auteur:pseudo},
        {_id:1,
          texte:1,
          date:1,
          auteur:1,
          srcPhotoUser:1,
          srcfile:1
        }).toArray(function(err, resultPostUser){
          if(err){
            console.log('error find collection PostIt /myDash'.error)
          } else {
            if(!pseudo){
              res.redirect('/');
            } else {
              res.render('mydash',
            {
              pseudo:pseudo,
              srcfile:resultSessionUser[0].srcfile,
              friends:resultSessionUser[0].friends.length,
              scrFileFriend:resultSessionUser[0].friends,
              allData:resultPostUser
            });
          }
        }
      });
    }
  });
});

/* DELETE POSTIT USER */
app.get('/delete/:id',function(req,res){  
  collectionPost_its.remove( {"_id":{"$oid":new ObjectId(req.params.id)}});
});

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

app.get('/modifLogin',function(req,res){
  if(req.session.pseudo){
  
        collectionUsers.find({pseudo:req.session.pseudo},{_id:0,genre:1,age:1,prenom:1,nom:1,pseudo:1,password:1,email:1,srcfile:1,presentation:1}).toArray(function(err, result) {
          var pseudo = req.session.pseudo;
          res.render('modifLogin',{genre: result[0].genre, age: result[0].age, prenom:result[0].prenom, nom:result[0].nom, pseudo:result[0].pseudo, password:result[0].password, email:result[0].email,srcfile:result[0].srcfile, presentation: result[0].presentation});
          });
        } else {
          var pseudo = '';
          res.redirect('/');
        }
});









app.post('/modifLogin',upload.single('recfile'),function(req,res){
  var collectionPost_its = db.get().collection('post_its')
  var pseudo = req.session.pseudo;
      collectionUsers.findOne({pseudo: req.body.pseudo}, function(err, result) {
        if(result){

          var pseudoExisted = 'Ce pseudo existe deja !';
          res.render('modifLogin',{exist:pseudoExisted});

        } else {
          var tmp_path = req.file.path
          var target_path = 'uploads/' + req.file.originalname;
          var src = fs.createReadStream(tmp_path);
          var dest = fs.createWriteStream(target_path);
          src.pipe(dest);

          collectionUsers.updateOne({pseudo:pseudo},{$set:{genre: req.body.genre, age: req.body.age, prenom : req.body.prenom, nom :req.body.nom, pseudo: req.body.pseudo, password: req.body.password, email: req.body.email, srcfile:target_path, presentation: req.body.present}},{upsert:false});
          collectionPost_its.updateOne({auteur:pseudo},{$set:{auteur: req.body.pseudo,srcPhotoUser:target_path}},{upsert:false});
            req.session.prenom = req.body.prenom;
            req.session.nom = req.body.nom;
            req.session.pseudo = req.body.pseudo;
            req.session.srcfile = 'uploads/' + req.file.originalname;
            res.redirect('profil');
      }
    }); 
});






 


               






///////////////////////////////////////////////////









/*
app.get('/creation',function(req,res){
     var pseudo = req.session.pseudo;
     var collectionUsers = db.get().collection('users');
   if(pseudo){
     collectionUsers.find({pseudo:pseudo},{_id:0,srcfile:1}).toArray(function(err, result) {
          res.render('dash',{pseudo:pseudo,srcfile:result[0].srcfile});
        });
        } else {
          var pseudo = '';
          res.redirect('/');
        }
});
*/




app.get('/post_its/:id',function(req,res){
    var pseudo = req.session.pseudo;
    var collectionUsers = db.get().collection('users');    

    collectionUsers.find({pseudo:pseudo},{_id:0,srcfile:1}).toArray(function(err, result) {    
    collectionPost_its.find({_id:new MongoDb.ObjectID(req.params.id)}).limit(1).toArray(function(err, data) {
      if(!pseudo){
        res.render('post_its',{valeur1:data,pseudo:pseudo});
      } else {
        res.render('post_its',{valeur1:data,pseudo:pseudo,srcfile:result[0].srcfile});
      }
    });
  });
});                      


app.post('/connexionPostIts',function(req,res){
    var pseudo = req.session.pseudo;

           collectionUsers.findOne({pseudo: req.body.pseudo , password: req.body.password}, function(err, result) {
             if(result){
               req.session.pseudo = req.body.pseudo;
               res.redirect('/')
             } else {
               res.redirect('/');
               var pseudo = '';
             }
         });
});






app.get('/commentaire',function(req,res){
  res.render('/post_its')
});



// Create comments for post // 
/*
app.post('/createComments/:id',function(req,res){
  var pseudo = req.session.pseudo
  if(pseudo){
    collectionUsers.find({pseudo:pseudo},{_id:0,srcfile:1}).toArray(function(err, resultUsers) {
      collectionPost_its.find({_id:req.params.id}).limit(1).toArray(function(err,resultPost){
      console.log('find user');
      collectionComments.insertOne({idPost:resultPost[0],auteur:pseudo,srcPhotoUser:resultUsers[0].srcfile,texte:req.body.corpsComments}, function(err, result) {
        console.log('insert comments');
        res.redirect('/dash');
        });
      }); 
    });
  } else {
    var pseudo = '';
  } 
})
*/


//------------------------------------------------------------------------------------------



app.post('/commentaire',type,function(req,res){
  var collectionCommentaires = db.get().collection('commentaires');
        if(req.session.login){
            var login = req.session.login;
            collectionCommentaires.insertOne({titre: req.body.titre, texte: req.body.texte, auteur : login, date : theDate}, function(err, result) {
            res.json({titre: req.body.titre,texte: req.body.texte,auteur : login,date : theDate})
            });
        } else {
          var login = '';
        }
});


// Compteur live Server //
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
      collectionUsers.find({}).count(function(err,result){
        if(err){
          console.log('error find Users for count error')

        } else if(result){
          io.emit('usersCountLog', result);
        }
      });
//Compteur post
      collectionPost_its.find({}).count(function(err,result){
        if(err){
          console.log('error find PostIts for count error')

        } else if(result){
          io.emit('postItsCountLog', result);
        }
      });

// Compteur live Server ends //  

// all post affichage // 

    collectionPost_its.find({}).sort({date : -1}).toArray(function(err, data) {
      io.emit('allPostDisplay',data);
    });

// all post affichage ends // 


// search bar // 

  socket.on( 'searchBar', function ( search ) { // quand je recoi des infos en socket , a chaque fois que quelqun tape une nouvelle lettre dans la bar de recherche du header
    console.log('valeur de search bar ' + search);
    collectionUsers.find( { pseudo: { $regex: '^'+search, $options: 'i' } } ).sort( { pseudo: 1 } ).toArray( function ( err, data ) { // je cherche tous les pseudo qui contien c lettre et je les tries
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
});




// Gestion de la connexion au démarrage
db.connect('mongodb://localhost:27017/DiwJs04', function(err) {
  if (err) {
    console.log('Impossible de se connecter à la base de données.');
    process.exit(1);
  } else {
    server.listen(3333, function(err) {
      if(err){
        console.log('Listen error')
      } else {
        console.log('Le serveur est disponible sur le port 3333'.rainbow);
      }
    });
  }
});
