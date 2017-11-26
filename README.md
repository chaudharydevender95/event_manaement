# Event Management Application

## models/user.js
First we create a user.js file inside models folder.Then userSchema is created inside user.js file.

```node.js
/* The user schema attributes*/
var UserSchema = new mongoose.Schema({
	email:{type:String, unique:true,lowercase:true},
	password:String,
	name:String,
	role:{type:String,default:'participant'}
});
```
A middleware with UserSchema is created which encrypt the password value enterd by user.

```node.js
/*Hash the password before we even save it to database*/
UserSchema.pre('save',function(next){
	var user = this;
	if(!user.isModified('password')) return next();
	bcrypt.genSalt(10,function(err,salt){
		if(err) return next(err);
		bcrypt.hash(user.password,salt,null,function(err,hash){
			if(err) return next(err);
			user.password = hash;
			next();
		});
	});
});
```
Method for compare password in encrypted form is written by using bcrypt library.

```node.js
/*Compare the password typed by user to that in database*/
UserSchema.methods.comparePassword = function(password){
	return bcrypt.compareSync(password,this.password);
}
```
Finnaly we export this file to be accessed from outside.
```node.js
module.exports = mongoose.model('User',UserSchema);
```

Further we proceed to create a route for user to log-in.
## routes/user.js
Post api for signup is created.
```node.js
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
```

## config/passport.js
Further we create passport.js file inside config folder. It contains necessary methods for serialize and deserialize a user object, middleware to authenticate user by validating email and password using local-strategy and funally a isValidate method to know the state of user. 
```node.js
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

// serialize and deserialize
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


//Middleware
passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done) {
  User.findOne({ email: email}, function(err, user) {
    if (err) return done(err);

    if (!user) {
      return done(null, false, req.flash('loginMessage', 'No user has been found'));
      
    }
    if (!user.comparePassword(password)) {
      return done(null, false, req.flash('loginMessage', 'Oops! Wrong Password pal'));
    }
    return done(null, user);
  });
}));

//custom function to validate
exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
} 
```

## routes/user.js
We again move to our route folder and create new route for login. 

```node.js
router.get('/login',function(req,res){
  if(req.user) 
  res.json(req.user);
  else res.send('Unauthenticated User');
});
```
```node.js
router.post('/login',passport.authenticate('local-login',{
  successRedirect:'/login',
  failureRedirect: '/login',
  failureFlash:true
}));
```
Api for profiel is craeted which is authenticated by isAuthenticated function.
```node.js
router.get('/profile',passportConf.isAuthenticated, function(req,res,next){
  User.findOne({_id:req.user._id},function(err,user){
    if(err) res.json(err);
    res.json(req.user);
  });
});
```

Finally api for logout is created to log-out a logged-in user.
```node.js
router.get('/logout',function(req,res,next){
  req.logout();
  res.send('User logged-out');
});
,,,

## models/event.js
Since we are to add events in our web app, so we craete schema for event.
```node.js
var mongoose = require('mongoose');
var User = require('../models/user')

var eventSchema = mongoose.Schema({
    title:String,
    organiser:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    location:String,
    description:String,
    date:Date,
    ticket_price:Number,
});


module.exports =  mongoose.model('Event',eventSchema);
```
## routes/organiser.js
Structure of event is ready for event to be added. So we create api for adding our events.
```node.js
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
```
```node.js
router.delete('/delete-event/:id',passport.isAuthenticated, function(req,res,next){
    
        Event.remove({_id:req.params.id},function(err,result){
            if(err) res.json(err);
            else res.send('Event Deleted');
        })
    
})
```
```node.js
router.put('/update-event/:id',function(req,res,next){
    Event.update({_id:req.params.id},
        {$set:{"description":"new content to update"}},function(err,result){
            if(err) res.json(err);
            else res.json(result);
        });
})
```

Finally our *organiser.js* file look as:-
```node.js
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
```

## routes/event.js
Api to see all the events is generated.
```node.js
router.get('/event_list',passport.isAuthenticated,function(req,res){
	Event
	.find({ })
	.populate()
	.exec(function(err,events){
		if(err) return next(err);
        res.json(events);
	});
});
```
Next API is to show individual event with is details.
```node.js
router.get('/event/:id',passport.isAuthenticated, function(req,res,next){
	Event.findById({ _id:req.params.id},function(err,event){
		if(err) return next(err);
        res.json(event);
	});
});
```

Final look of our event.js with its imported libraries is:
```node.js
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

module.exports = router;
```

## models/comment.js
Since a participant can comment on post. So we create Schema for comment.
```node.js
var mongoose = require('mongoose');
var User = require('../models/user')

var commentSchema = mongoose.Schema({
    content:String,
    owner:{type: mongoose.Schema.Types.ObjectId, ref: 'User'}
})

module.exports = mongoose.model('Comment',commentSchema);
```
Since comment is added to a post so we need to add a field inside Schema of _event_. We add the below line:
```node.js
comments:[{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
```

## routes/participant.js
A new route for participants is created. _Api_s for adding comments are:
```node.js
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

module.exports = router;
```
