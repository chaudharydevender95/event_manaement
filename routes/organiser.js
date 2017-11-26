var router = require('express').Router();
var Event = require('../models/event');
var passport = require('../config/passport')


router.post('/add-event',passport.isAuthenticated,function(req,res,next){
   
        var event = new Event({
            title:req.body.title,
            organiser:req.user._id,
            location:req.body.location,
            description:req.body.description,
            date:new Date(req.body.date),
            ticket_price:req.body.ticket_price
        });

        event.save(function(err,result){
            if(err) res.json(err);
            else res.json(result);
        })
   
})

router.delete('/delete-event/:id',passport.isAuthenticated, function(req,res,next){
    
        Event.remove({_id:req.params.id},function(err,result){
            if(err) res.json(err);
            else res.send('Event Deleted');
        })
    
})

router.put('/update-event/:id',function(req,res,next){
    Event.update({_id:req.params.id},
        {$set:{"description":"new content to update"}},function(err,result){
            if(err) res.json(err);
            else res.json(result);
        });
})

module.exports = router;