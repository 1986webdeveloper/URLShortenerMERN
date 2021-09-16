const mongoose = require('mongoose')

const URLSchema = new mongoose.Schema({
    urlCode: String, 
    longUrl: String,
    shortUrl: String,
    valid: Boolean,
    date:{type: String, default: Date.now}
})

module.exports = mongoose.model('urlmaster',URLSchema)
