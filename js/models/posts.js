
/* Utilisation du module Mongoose qui va servir de passerelle entre mon serveur Node.js et ma BDD MongoDB.
Je vais utiliser un Schema » pour modéliser mes données. Il permet de définir les types de variables et de structurer mes données */

/*Appel au module Mongoose */


var mongoose = require('mongoose');
var postSchema = mongoose.Schema({
    texte : String,
    auteur : String,
    date : String,
    srcfile : String,
    srcPhotoUser : String,
    comments: [
        {
            auteur: String,
            texte: String,
            date: String,
            srcPhotoUser : String,

        }
    ]
});
module.exports = mongoose.model('Post', postSchema);
