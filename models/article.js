'use strict'

var mongoose = require('mongoose');
var schema = mongoose.Schema;

var ArticleSchema = mongoose.Schema({
    title: String,
    content: String,
    date: { type: Date, default: Date.now },
    image: String
});

module.exports = mongoose.model('Article', ArticleSchema);
//articles --> guarda docuemntos de este tipo y con esta estructura dentro de la colección 