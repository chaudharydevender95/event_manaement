var express = require('express');
var morgan = require('morgan'); //get route on terminal
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var ejs_mate = require('ejs-mate');
var path = require('path');
var v6 = require('ipv6').v6; var address = new v6.Address('MY IPv6 Address');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('express-flash');
var mongoStore = require('connect-mongo/es5')(session);
var passport = require('passport');

var app = express();
var User = require('./models/user');
var secret = require('./config/secret');
var passportConfig = require('./config/passport');


app.listen(secret.port,function(err,next){
	if(err) return next(err);
	console.log("Server is running at port "+secret.port);
});

mongoose.connect(secret.database,function(err){
	if(err) console.log(err);
	else console.log("Connected to databse");
});



//body-parser to parse data from server
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true}));
app.engine('ejs',ejs_mate);
app.set('view engine','ejs');
app.use(cookieParser());
app.use(session({
	resave:true,
	saveUninitialized:true,
	secret:secret.secretKey,
	store: new mongoStore({ url:secret.database,autoReconnect:true})
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req,res,next){
	res.locals.user = req.user;
	next();
});



app.use('/organiser/*',passportConfig.isAuthenticated, function(req,res,next){
	if(req.user.role != 'organiser') res.send('Not priviledged');
	else next();
})

var userRoutes = require('./routes/user');
var eventRoute = require('./routes/events');
var organiserRoute = require('./routes/organiser');
var participant = require('./routes/participant');

app.use(userRoutes);
app.use(eventRoute);
app.use('/organiser',organiserRoute);
app.use(participant);


module.exports = app;