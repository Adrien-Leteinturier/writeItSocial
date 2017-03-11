/* Utilisation du module Mongoose qui va servir de passerelle entre mon serveur Node.js et ma BDD MongoDB.
Je vais utiliser un Schema » pour modéliser mes données. Il permet de définir les types de variables et de structurer mes données */

/*Appel au module Mongoose */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/* Shema pour utilisateurs */
var chatsSchema = mongoose.Schema({
    hote:String,
    srcfile:String,
    participants: [
        {
            pseudo:String,
            srcfile:String
        }
    ],
    messages: [
        {
            pseudo:String,
            date:String,
            texte:String
        }
    ]
});

module.exports = mongoose.model('Chats', chatsSchema);
