var router = require('express').Router();
var Event = require('../models/event');
var Comment = require('../models/comment')
var passport = require('../config/passport')

router.post('/comment_event/:id',passport.isAuthenticated, function(req,res,next){
    var comment = new Comment({
        content:req.body.content,
        owner:req.user._id
    })
    
    comment.save(function(err){
        if(err) req.send(comment.content+' category already exist');
        else{
            Event.update({_id:req.params.id},{$push:{comments:comment._id}},(err,user)=>{
            if(err) res.json(err);
            else res.send('Commented successfully');
             });        
        }
    })
    
})

router.get('/filtered/:title/:organiser',passport.isAuthenticated,function(req,res,next){
    Event.find({$and:[{title:req.params.title},{organiser:req.params.organiser}]},function(err,result){
        if(err) res.json(err);
        else res.json(result);
    })
})


module.exports = router;
