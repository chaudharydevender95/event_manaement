var mongoose = require('mongoose');
var User = require('../models/user')

var commentSchema = mongoose.Schema({
    content:String,
    owner:{type: mongoose.Schema.Types.ObjectId, ref: 'User'}
})

module.exports = mongoose.model('Comment',commentSchema);