var mongoose = require('mongoose');
var User = require('../models/user')

var eventSchema = mongoose.Schema({
    title:String,
    organiser:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    location:String,
    description:String,
    date:Date,
    comments:[{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
    ticket_price:Number,
});


module.exports =  mongoose.model('Event',eventSchema);