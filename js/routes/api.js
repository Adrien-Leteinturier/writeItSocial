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
var Chats = require('../models/chat.js'); //On va mainteant importer notre modèle pour pouvoir l'utiliser dans notre application (app/models/user.js)
var mySecret = config.secret; /* variable qui fait appel  */



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
      if(!req.file){
        var users = new Users();
        users.genre = req.body.genre;
        users.age = req.body.age;
        users.prenom = req.body.prenom;
        users.nom = req.body.nom;
        users.pseudo = req.body.pseudo;
        users.password = req.body.password;
        users.email = req.body.email;
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
  

/*apiRoutes.route('/comments/:_id')
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
    })

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
           //   for(var i = 0; i<user.friends.length;i++){
                if(user.friends.map(e => e.pseudo).indexOf(userPublic.pseudo) !== -1){ //map retourne un tableau de tout mes amis et verifie si la personne est mon amis ou pas 
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
                pseudo:userPublicInvite.pseudo,
                srcfile:userPublicInvite.srcfile,
                status: 'Invitation en cours...'
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
    })   

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
            console.log('ici audrey' + model);
           /* model.messages.sort(function (a,b) {
            return b.date - a.date ;
            });  */          
            io.emit('displayMess',model.messages);
            io.emit('displayMessPublic',model.messages);
            console.log(err);
            if(model.pseudo === user.pseudo){
              Users.distinct('admin', function(error, results){
                console.log('distinct value' + results);
              });
              return
            } else {
            var mailMdpLost = {
              from: "WriteItSocial@gmail.com",
                to: userFriends.email,
                  subject: user.pseudo + " Vous à envoyé un message " ,
                  html: "<img src='http://localhost:8080/images/logo-footer.png'/><div class='contentMail'><p>Bonjour</p><h2 style='color:'#265A88'> " + userFriends.pseudo + "</h2><br><h2>" + user.pseudo + " vous à envoyé un message , vous pouvez repondre à ce massage dans votre espace message</h2></div>"
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
    .post(function(req,res){
      Users.findOne({pseudo:req.session.pseudo},function(err,user){
        if(err){
          console.log('error find User session route /chat .post')
        } else {
          var chat = new Chats();
          chat.hote = user.pseudo;
          chat.srcfile = user.srcfile;
          chat.save(function(err){
            if(err){
              console.log('error save chat session route /chat .post')
            } else {
              Chats.find({hote:req.session.pseudo},function(err,userChats){
                console.log('aller lOM' + userChats)
              io.emit('displayChat',userChats);
              })
            }
          })
        }
      });
    })
  

  apiRoutes.route('/chat/:_id')
    .get(function(req,res){
      Chats.findById(req.params._id,function(err,chatSession){
        //console.log(req.params._id);
        if(err){
          console.log('error find Chat session route /chat:_id .get');
        } else {
         Users.findOne({pseudo: req.session.pseudo},function(err,user){
            if(err){
              console.log('error find user session route /chat:_id .get');
            } else {
              if(user.pseudo == chatSession.hote){
                console.log('hote')
                return
              } else {
              part = 
                {
                  pseudo:user.pseudo,
                  srcfile:user.srcfile
                }  
              Chats.findByIdAndUpdate(
                {_id: chatSession._id},
                {$push: {participants: part}},
                {safe: true, upsert: false, new:true},
                function(err, model) {  
                });               
              }
              res.render('roomChat',{
                userFriend:user.friends,  
                pseudo:user.pseudo,
                srcfile:user.srcfile,
                friends: user.friends.length,
                chat:chatSession
              });
              io.emit('displaySessionListPart',chatSession.participants)
            }
          });
        }
      });
    })
    .post(function(req,res){
        Users.findOne({pseudo:req.session.pseudo},function(err,user){
          Chats.findById(req.params._id,function(err,chatSession){
            console.log(chatSession._id)
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
                if(model.hote === user.pseudo){
                  return
                } else {
                var mailMdpLost = {
                  from: "WriteItSocial@gmail.com",
                    to: userFriends.email,
                      subject: user.pseudo + " Vous à envoyé un message " ,
                      html: "<img src='http://localhost:8080/images/logo-footer.png'/><div class='contentMail'><p>Bonjour</p><h2 style='color:'#265A88'> " + userFriends.pseudo + "</h2><br><h2>" + user.pseudo + " vous à envoyé un message , vous pouvez repondre à ce massage dans votre espace message</h2></div>"
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


