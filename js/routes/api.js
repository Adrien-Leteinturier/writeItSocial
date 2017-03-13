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
var Chats = require('../models/chat.js'); //On va mainteant importer notre modèle pour pouvoir l'utiliser dans notre application (app/models/user.js)
var mySecret = config.secret; /* variable qui fait appel a la config pour la verif du token  */

/****************NODE MAILER CONFIG*********************/ 
var smtpTransport = mailer.createTransport("SMTP",{
  service: "Gmail",
	  auth: {
		  user: "adrienleteinturier@gmail.com",
			pass: ""
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

  /****************ROUTE PAGE ACCUEIL*********************/ 

  apiRoutes.get('/index',function(req,res){
    res.redirect('/');
  })
  apiRoutes.get('/', function(req, res) {
    Post.find({},function(err,posts){
      var data1 = posts.slice (0, 5);
      var data2 = posts.slice (5, 10);
      res.render('index',{
        feedLiveArray1:data1,
        feedLiveArray2:data2});
    })
  });  

  /****************ROUTE MOT DE PASSE OUBLIER*********************/ 
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

  /****************ROUTE INSCRIPTION *********************/ 
    apiRoutes.route('/inscription')
    .get(function(req,res){
      res.render('inscription');
    })
    .post(upload.single('recfile'),function(req,res){
      if(!req.file){
        var users = new Users();
        users.genre = req.body.genre;
        users.age = req.body.age;
        users.prenom = req.body.prenom;
        users.nom = req.body.nom;
        users.pseudo = req.body.pseudo;
        users.password = req.body.password;
        users.email = req.body.email;
        users.role = 0;
        users.srcfile = 'http://lorempixel.com/400/200/abstract';
        users.presentation = req.body.present;
      } else {
        var users = new Users();
        users.genre = req.body.genre;
        users.age = req.body.age;
        users.prenom = req.body.prenom;
        users.nom = req.body.nom;
        users.pseudo = req.body.pseudo;
        users.password = req.body.password;
        users.email = req.body.email;
        users.role = 0;        
        users.srcfile = 'uploads/' + req.file.filename ;
        users.presentation = req.body.present;
      }
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


  /****************ROUTE PAGE ACCUEIL*********************/ 

  apiRoutes.get('/aPropos',function(req,res){
    res.render('aPropos');
  })

  /****************ROUTE VERIF USER CONNEXION MIDDLEWARE*********************/     
  apiRoutes.post('/authenticate', function(req, res) {
    Users.findOne({pseudo: req.body.pseudo},function(err,user){
      if (err) throw err;
      if (!user) {
        res.redirect('/')
      } else if (user) {
        // verifie si le password correspond
        if (user.password != req.body.password) {
          res.redirect('/')
        } else {
          // cretion d'un token
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
          // verification du role de l'utilisateur
          if(user.role === 1){
            res.redirect('/admin')
          } else {
            res.redirect('/dash');
          } 
        }   
      }
    });
  });
  apiRoutes.use(function(req, res, next) {
    // Vérifier les paramètres d'en-tête ou d'url ou post paramètres pour le jeton
    var token = req.session.token;
    // decode token
    if (token) {
      // Vérifie le secret et vérifie les exp
      jwt.verify(token, mySecret, function(err, decoded) {      
        if (err) {
          return res.json({ success: false, message: 'Failed to authenticate token.' });   
          res.redirect('/') 
        } else {
          // Si tout est bon, sauf pour demander à utiliser dans d'autres itinéraires
          req.decoded = decoded;    
          next();
        }
      });
    } else {
      // S'il n'y a pas de jeton
       // redirect a l'index
      res.redirect('/');
    }
  });


/****************ROUTE ADMIN*********************/ 
  apiRoutes.route('/admin')
    .get(function(req, res){
      Users.find({},function(err,allUser){
      Users.findOne({pseudo: req.session.pseudo},function(err,user){
        if(err) {
          res.send(err);
        } else {
          res.render('admin',{
          userFriend:user.friends,  
          pseudo:user.pseudo,
          srcfile:user.srcfile,
          friends: user.friends.length,
          allUtilisateur : allUser,
          });
        }
      });
    })
  });

  apiRoutes.route('/allChat')
    .get(function(req, res){
      Chats.find({},function(err,allChats){
      Users.find({},function(err,allUser){        
        Users.findOne({pseudo: req.session.pseudo},function(err,user){
        if(err) {
            res.send(err);
          } else {
            if(user.role === 1){
              res.render('allChat',{
              userFriend:user.friends,  
              pseudo:user.pseudo,
              srcfile:user.srcfile,
              friends: user.friends.length,
              allUtilisateur : allUser,
              allChatUser : allChats
              });
            } else {
              res.redirect('/')
            }
          }
        });
      })
    })
  });  

/****************ROUTE ADMIN*********************/ 


/****************ROUTE PAGE PRINCIPAL*********************/ 
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
/****************ROUTE CREATION POSTS*********************/   
  .post(upload.single('file'),function(req,res){
    var date = new Date();
    var datePost = date.toLocaleString(); 
    Users.findOne({pseudo:req.session.pseudo},function(err,user){
     if(err) {
      res.send(err);
     } else {
       if(!req.file){
        var posts = new Post();
        posts.texte = req.body.textPost;
        posts.auteur = user.pseudo;
        posts.date = datePost;
        posts.srcfile = '';
        posts.srcPhotoUser = user.srcfile;
       } else {
        var posts = new Post();
        posts.texte = req.body.textPost;
        posts.auteur = user.pseudo;
        posts.date = datePost;
        posts.srcPhotoUser = user.srcfile;         
        posts.srcfile = 'uploads/' + req.file.filename;
       }
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


/****************ROUTE LES POSTS DE L'USER*********************/  
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

/****************ROUTE DELETE DE POST*********************/  
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
/****************ROUTE MODIFIER LE POST*********************/  
  .post(upload.single('recfile'),function(req,res){
    Post.findById(req.params._id, function(err,posts){
      if(err){
        throw err;
      } else {
       var date = new Date();
       var datePost = date.toLocaleString();     
        if(!req.file){
          posts.texte = req.body.textPost;
          posts.auteur = req.session.pseudo;
          posts.srcfile = posts.srcfile;
          posts.date = datePost;
        } else {
          posts.texte = req.body.textPost;
          posts.auteur = req.session.pseudo;
          posts.srcfile = 'uploads/' + req.file.filename;
          posts.date = datePost;          
        }
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

/****************ROUTE PROFIL USER CONNECTER*********************/  
  apiRoutes.route('/profil')
    .get(function(req,res){
      Users.findOne({pseudo: req.session.pseudo},function(err,user){
        io.emit('displayMess',user.messages)
        if(err){
          throw err;
        } else {
          res.render('profil',{
            userId : user._id,
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
            userPublicMessages: user.messages
          });          
        }
      });      
    })
/****************ROUTE MODIFIER PROFIL USER CONNECTER*********************/     
    .post(function(req,res){
      Users.find({},function(err,allUser){
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
    })
/****************ROUTE PROFIL PUBLIC PAS AMIS OU AMIS*********************/ 
  apiRoutes.route('/profilPublic/:_id')
  .get(function(req,res){
    Users.findOne({pseudo: req.session.pseudo},function(err,user){
    if(err){
      throw err;
    } else {
      Users.findById(req.params._id,function(err,userPublic){
        Post.find({auteur:userPublic.pseudo},function(err,userPostPublic){
            if(err) {
              throw err;
            } else {
              if(user.pseudo === userPublic.pseudo){
                res.redirect('/profil');
              }
           //   for(var i = 0; i<user.friends.length;i++){
                if(user.friends.map(e => e.pseudo).indexOf(userPublic.pseudo) !== -1 || user.role === 1){ //map retourne un tableau de tout mes amis et verifie si la personne est mon amis ou pas 
                  res.render('profilFriends',{
                    userFriend:user.friends,  
                    pseudo:user.pseudo,
                    srcfile:user.srcfile,
                    friends: user.friends.length,
                    userPublicId : userPublic._id,
                    userPublicPrenom: userPublic.prenom,
                    userPublicNom: userPublic.nom,
                    userPublicSrcFile : userPublic.srcfile,
                    userPublicPseudo : userPublic.pseudo,
                    userPublicPresent : userPublic.presentation,
                    userPublicCountFriends : userPublic.friends.length,
                    userPubliCountPost : userPostPublic.length,
                    userPublicMessages : userPublic.messages,
                    allPostUserFriends : userPostPublic
                  })
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
            //  }
            }
          });
        });
      }
    })
  })
/****************ROUTE INVITATION AMIS *********************/   
  .post(function(req,res){
    Users.findById(req.params._id,function(err,userPublicInvite){
      Users.findOne({pseudo:req.session.pseudo},function(err,user){
        if(err){
          throw err;
        } else {
    if(err){
      throw err;
    } else {
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
            addFriends = 
              {
                _id:userPublicInvite._id,
                pseudo:userPublicInvite.pseudo,
                srcfile:userPublicInvite.srcfile,
                status: 'En attente de confirmation...'
              }
            
            Users.findByIdAndUpdate(
                {_id: user._id},
                {$push: {friends: addFriends}},
                {safe: true, upsert: true},
                function(err, model) {
                    console.log(err);
                }
            );
            res.redirect('/friends')
          }
        }
      });
    }); 
  })

/****************ROUTE VALIDATION PAR MAIL POUR AMIS *********************/ 
  apiRoutes.route('/validInvite/:_id')
    .get(function(req,res){
      Users.findById(req.params._id,function(err,userPublicInvite){
        Users.findOne({pseudo:req.session.pseudo},function(err,user){
          if(err){
            throw err;
          } else {
            for(var i = 0;i<user.friends.length;i++){
              if(userPublicInvite.pseudo === user.friends[i].pseudo){
                user.friends[i].status = 'Amis';
                user.save(function(err) {
                  if(err) {
                    throw err;
                  } else {
                    console.log('status user modfified')
                  }
                })//user.save                    
              }
            }
            addFriends = {
                _id : user._id,
                pseudo:user.pseudo,
                srcfile:user.srcfile,
                status: 'Amis'              
            }
            Users.findByIdAndUpdate(
                {_id: userPublicInvite._id},
                {$push: {friends: addFriends}},
                {safe: true, upsert: true},
                function(err, model) {
                    console.log(err);
                }
            );            
          var mailMdpLost = {
            from: "WriteItSocial@gmail.com",
              to: user.email,
                subject: userPublicInvite.pseudo + " a confirmé l'invitation " ,
                html: "<img src='http://localhost:8080/images/logo-footer.png'/><div class='contentMail'><p>Bonjour</p><h2 style='color:'#265A88'> " + user.pseudo + "</h2><br><h2>Vous etes maintenant amis avec"+ "<br>" + userPublicInvite.pseudo +"</h2></div>"
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
            res.redirect('/index');                
          }            
        });
      });
    });

/****************ROUTE LISTE DES AMIS *********************/     
  apiRoutes.route('/friends')
    .get(function(req, res){
    Users.findOne({pseudo: req.session.pseudo},function(err,user){
      if(err){
        throw err
      } else {
        res.render('friends',{
        userFriend:user.friends,
        pseudo:user.pseudo,
        srcfile:user.srcfile,
        friends: user.friends.length
        });
      }
    });
  });

/****************ROUTE DELETE MESSAGES PRIVEES USER CONNECTER*********************/ 
  apiRoutes.route('/deleteMessages/:_id')
    .get(function(req,res){
      Users.findOne({pseudo:req.session.pseudo}, function(err,result) {
        if(err) {
          throw err;
        } else {
          for(var i=0; i < result.messages.length; i++){
            console.log(result.messages[i]._id);
            if(result.messages[i]._id == req.params._id){
              console.log('oui')
              result.messages.id(req.params._id).remove();
              result.save(function (err) {
                if (err) return handleError(err);
                  console.log('the sub-doc was removed')
              });      
            }
          }
          io.emit('displayMess',result.messages);
          io.emit('displayMessPublic',result.messages);
          res.send(result);
        }          
      })
    });

/****************ROUTE POSTER MESSAGE AMIS *********************/ 
  apiRoutes.route('/postMessage/:_id')
  .post(function(req,res){
    Users.findOne({pseudo:req.session.pseudo},function(err,user){
      Users.findById(req.params._id,function(err,userFriends){
        var date = new Date();
        var dateMessage = date.toLocaleString(); 
        mess = 
          {
            pseudo:user.pseudo,
            srcfile:user.srcfile,
            date:dateMessage,
            texte:req.body.messagePost
          }  
        Users.findByIdAndUpdate(
          {_id: userFriends._id},
          {$push: {messages: mess}},
          {safe: true, upsert: true, new:true, sort:{messages:-1}},
          function(err, model) {       
            io.emit('displayMess',model.messages);
            io.emit('displayMessPublic',model.messages);
            console.log(err);
            if(model.pseudo === user.pseudo){
              Users.distinct('admin', function(error, results){
              });
              return
            } else {
            var mailMdpLost = {
              from: "WriteItSocial@gmail.com",
                to: userFriends.email,
                  subject: user.pseudo + " Vous à envoyé un message " ,
                  html: "<img src='http://localhost:8080/images/logo-footer.png'/><div class='contentMail'><p>Bonjour</p><h2 style='color:'#265A88'> " + userFriends.pseudo + "</h2><br><h2>" + user.pseudo + " vous à envoyé un message , vous pouvez repondre à ce message dans votre espace message</h2></div>"
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
            }
          }
        );      
      });
    });
  })
/****************ROUTE DELETE PROFIL *********************/ 
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

//#################################

/****************ROUTE POUR LES CHATS AVANT CONNEXION *********************/ 
  apiRoutes.route('/chat')
    .get(function(req,res){
      Chats.find({hote:req.session.pseudo},function(err,userChats){
        if(err){
          console.log('error find User session route /chat .get');
        } else {
         Users.findOne({pseudo: req.session.pseudo},function(err,user){
            console.log(userChats);
            if(err){
              console.log('error find Chats user session route /chat .get');
            } else {
              res.render('chatBoard',{
                userListInviteChat : user.invitationChat,
                userFriend:user.friends,  
                pseudo:user.pseudo,
                srcfile:user.srcfile,
                friends: user.friends.length,
                listUserChats : userChats
              });
            }
          });
        }
      });
    })
/****************ROUTE CREATION CHAT CONNECTER*********************/     
    .post(function(req,res){
      Users.findOne({pseudo:req.session.pseudo},function(err,user){
        if(err){
          console.log('error find User session route /chat .post')
        } else {
          var date = new Date();
          var dateCreateChat = date.toLocaleString(); 
          var chat = new Chats();
          chat.hote = user.pseudo;
          chat.srcfile = user.srcfile;
          chat.createDate = dateCreateChat;
          chat.save(function(err){
            if(err){
              console.log('error save chat session route /chat .post')
            } else {
              console.log('ICIICI' + req.session.pseudo)
            }
            res.redirect('/chat');
          })
        }
      });
    })

/****************ROUTE REJOINDRE CHAT AVEC VERIFICATION SI C LA PERSONNE EST DEJA VENU DANS LA SESSION ET SI USER CONNECTER
 * EST L HOTE IL N'EST PAS AJOUTER A LA LISTE DES PARTICIPANTS AVEC ENVOIS D'UN MAIL A L'HOTE SI UNE PERSONNE INVITER REJOINS LE CHAT *********************/ 
  apiRoutes.route('/chat/:_id')
    .get(function(req,res){
      Chats.findById(req.params._id,function(err,chatSession){
        if(err){
          console.log('error find Chat session route /chat:_id .get');
        } else {
         Users.findOne({pseudo: req.session.pseudo},function(err,user){
            if(err){
              console.log('error find user session route /chat:_id .get');
            } else {
                if(user.pseudo == chatSession.hote || chatSession.participants.map(e => e.pseudo).indexOf(user.pseudo) !== -1){
                res.render('roomChat',{
                  userFriend:user.friends,  
                  pseudo:user.pseudo,
                  srcfile:user.srcfile,
                  friends: user.friends.length,
                  chat:chatSession
                });      
                 io.emit('displaySession',chatSession.participants)
              } else {
                part = 
                  {
                    pseudo:user.pseudo,
                    srcfile:user.srcfile
                  }  
                Chats.findByIdAndUpdate(
                  {_id: chatSession._id},
                  {$push: {participants: part}},
                  {safe: true, upsert: true, new:true},
                  function(err, model) {  
                  io.emit('displaySession',model.participants)
                  res.render('roomChat',{
                    userFriend:user.friends,  
                    pseudo:user.pseudo,
                    srcfile:user.srcfile,
                    friends: user.friends.length,
                    chat:chatSession
                  });
                    Users.findOne({pseudo:chatSession.hote},function(err,userHote){
                      var mailMdpLost = {
                        from: "WriteItSocial@gmail.com",
                          to: userHote.email,
                            subject: user.pseudo + " à rejoins votre chat " ,
                            html: "<img src='http://localhost:8080/images/logo-footer.png'/><div class='contentMail'><p>Bonjour</p><h2 style='color:'#265A88'> " + userHote.pseudo + "</h2><br><h2>" + user.pseudo + " à rejoins votre chat</h2></div>"
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
                    })             
                });           
              }
            }
          });
        }
      });
    })
/****************ROUTE POSTER MESSAGE SUR LA ROOM CHAT*********************/     
    .post(function(req,res){
        Users.findOne({pseudo:req.session.pseudo},function(err,user){
          Chats.findById(req.params._id,function(err,chatSession){
            var date = new Date();
            var dateMessageChat = date.toLocaleString(); 
            mess = 
              {
                pseudo:user.pseudo,
                srcfile:user.srcfile,
                date:dateMessageChat,
                texte:req.body.messageChat
              }  
            Chats.findByIdAndUpdate(
              {_id: chatSession._id},
              {$push: {messages: mess}},
              {safe: true, upsert: true, new:true, sort:{messages:-1}},
              function(err, model) {      
              io.emit('displayMessageSession',model.messages);
              console.log(err);
            }
          );      
        });
      });
    })
/****************ROUTE DELETE CHAT *********************/ 
    apiRoutes.route('/deleteChat/:_id')
      .get(function(req,res){
        Chats.findById(req.params._id, function(err,chat) {
          if(err) {
            throw err;
          } else {
            chat.remove({});
            res.redirect('/chat');
          }
        })
      })
/****************ROUTE INVITATION AUX AMIS DE REJOINDRE LE CHAT*********************/ 
  apiRoutes.route('/inviteChat/:_id')
    .post(function(req,res){
      Users.findOne({pseudo:req.session.pseudo},function(err,user){
        if(err){
          console.log('error find user session route /chat:_id .put');
        } else {
          Users.findById(req.params._id,function(err,userFriends){
            if(err){
              console.log('error find Chat session route /chat:_id .put');
            } else {
            var date = new Date();
            var dateInviteChat = date.toLocaleString(); 
              var inviteChat = {
                hote : user.pseudo,
                srcfile : user.srcfile,
                date : dateInviteChat,      
                url: req.body.urlChat    
              }
              Users.findByIdAndUpdate(
                  {_id: userFriends._id},
                  {$push: {invitationChat: inviteChat}},
                  {safe: true, upsert: true, new:true},
                  function(err, model) {  
                }); 
                var mailMdpLost = {
                from: "WriteItSocial@gmail.com",
                to: userFriends.email,
                subject: user.pseudo + " Vous à envoyé une invitation à son chat " ,
                html: "<img src='http://localhost:8080/images/logo-footer.png'/><div class='contentMail'><p>Bonjour</p><h2 style='color:'#265A88'> " + userFriends.pseudo + "</h2><br><h2>" + user.pseudo + " vous à envoyé une invitation à son chat , accessible sur votre espace chat.</h2></div>"
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
            }
          })
        }
      })
    });


/****************ROUTE DECONNEXION*********************/       
    apiRoutes.route('/deconnexion')  
    .get(function(req,res){
      req.session.destroy(function(err) {
        req.token = null;
        res.redirect('/');
      })
    })







/**********************SOCKET***************************/ 

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


  //Compteur post
    Chats.find({}).count(function(err,result){
      if(err){
        console.log('error find PostIts for count error')
      } else if(result){
        io.emit('chatCount', result);
      }
    });    
  
  
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
