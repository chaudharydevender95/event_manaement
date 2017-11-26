var router = require('express').Router();
var User = require('../models/user');
var passport = require('passport');
var passportConf = require('../config/passport');

router.get('/login',function(req,res){
  if(req.user) 
  res.json(req.user);
  else res.send('Unauthenticated User');
});

router.post('/login',passport.authenticate('local-login',{
  successRedirect:'/login',
  failureRedirect: '/login',
  failureFlash:true
}));

router.get('/',function(req,res,next){
  res.home('Home Page');
});

router.get('/profile',passportConf.isAuthenticated, function(req,res,next){
  User.findOne({_id:req.user._id},function(err,user){
    if(err) res.json(err);
    res.json(req.user);
  });
});

router.get('/logout',function(req,res,next){
  req.logout();
  res.send('User logged-out');
});

router.post('/signup',function(req,res,next){
  var user = new User();

  user.name = req.body.name;
  user.password = req.body.password;
  user.email = req.body.email;

  User.findOne({email:req.body.email },function(err,existingUser){

    if(existingUser){
      res.send('Existing User')
    }else{
      user.save(function(err){
        if(err) return next(err);
        res.send('Created a new User');
      });
    }
  });
});
module.exports = router;
