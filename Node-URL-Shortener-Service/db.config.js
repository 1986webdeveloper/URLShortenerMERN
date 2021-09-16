const mongoose = require('mongoose')

const DB_URI = 'mongodb+srv://meet:Mongo212@urlshortner.bkqz3.mongodb.net/url_shortener'

mongoose.connect(DB_URI,{useNewUrlParser:true, useUnifiedTopology:true})

const connection = mongoose.connection

module.exports = connection
