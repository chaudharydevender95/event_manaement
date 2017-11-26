var mongoose  = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var schema = mongoose.Schema;
var crypto = require('crypto');

/* The user schema attributes*/
var UserSchema = new mongoose.Schema({
	
	email:{type:String, unique:true,lowercase:true},
	password:String,
	name:String,
	role:{type:String,default:'participant'}
	
});

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


/*Compare the password typed by user to that in database*/
UserSchema.methods.comparePassword = function(password){
	return bcrypt.compareSync(password,this.password);
}

module.exports = mongoose.model('User',UserSchema);
