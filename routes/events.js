var router = require('express').Router();
var Event = require('../models/event');
var passport = require('../config/passport')

router.get('/event_list',passport.isAuthenticated,function(req,res){
	Event
	.find({ })
	.populate()
	.exec(function(err,events){
		if(err) return next(err);
        res.json(events);
	});
});

router.get('/event/:id',passport.isAuthenticated, function(req,res,next){
	Event.findById({ _id:req.params.id},function(err,event){
		if(err) return next(err);
        res.json(event);
	});
});

router.get('/add-event',function(req,res,next){
    res.render('admin/add-event',{message:req.flash('success'),errors:req.flash('error')});
});




module.exports = router;