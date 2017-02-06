/* Utilisation du module Mongoose qui va servir de passerelle entre mon serveur Node.js et ma BDD MongoDB.
Je vais utiliser un Schema » pour modéliser mes données. Il permet de définir les types de variables et de structurer mes données */

/*Appel au module Mongoose */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/* Shema pour utilisateurs */
var usersSchema = mongoose.Schema({
    name: String,
    genre : String,
    age : Number,
    prenom : String,
    nom : String,
    pseudo : {type: String, required: true, index: { unique: true }},
    password : {type: String, required: true, select: false},
    email : String,
    srcfile : String,
    presentation : String,
    role : Number,
    friends : [ 
        {
            pseudo : String,
            srcfile : String
        }
    ]
});

module.exports = mongoose.model('Users', usersSchema);
