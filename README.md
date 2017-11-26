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
