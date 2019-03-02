const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

const userService = require('../users/user.service');

/*
const basicAuth = require('./_helpers/basic-auth');
const errorHandler = require('./_helpers/error-handler');*/

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
	ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'

const serverUser = "system-hex"
const serverPwd = "Lancelot2018"
const serverHost = "system-hex-t3whh.mongodb.net"
const appName = "test?retryWrites=true"
const mongoURL = "mongodb+srv://"+serverUser+":"+serverPwd+"@"+serverHost+"/"+appName;
const mongoURLLabel = "mongodb+srv://"+serverHost+"/"+appName;

var db = null,
	dbDetails = new Object();

var initDb = function(callback) {
	if (mongoURL == null) return;

	var mongodb = require('mongodb').MongoClient;
	if (mongodb == null) return;

	mongodb.connect(mongoURL, function(err, conn) {
		if (err) {
		callback(err);
		return;
		}

		db = conn.db('system-hex');
		dbDetails.databaseName = db.databaseName;
		dbDetails.url = mongoURLLabel;
		dbDetails.type = 'MongoDB';

		console.log('Connected to MongoDB at: %s', mongoURL);
/*
		db.collection('users').find().toArray((err, result) => {
			if (err) return console.log(err)
			users = result;
		});


		// use basic HTTP auth to secure the api
		app.use(basicAuth);

		// api routes
		app.use('/users', require('./users/users.controller'));

		// global error handler
		app.use(errorHandler);*/

		// start server
		const server = app.listen(port, function () {
			console.log('Server listening on port ' + port);
		});
	});
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use(cookieParser());

app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    next();
});

var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/dashboard');
    } else {
        next();
    }
};

app.get('/', sessionChecker, (req, res) => {
    res.redirect('/login');
});

app.route('/login')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/public/login.html');
	})

    .post((req, res) => {
        var username = req.body.username,
			password = req.body.password;

		const user = await userService.authenticate({ username, password });
		if (!user) {
			res.redirect('/login');
		}else{
			req.session.user = user.dataValues;
			res.redirect('/observation');
		}
    });

app.get('/observation', (req, res) => {
	if (req.session.user && req.cookies.user_sid) {
		res.sendFile(__dirname + '/public/observation.html');
	} else {
		res.redirect('/login');
	}
});
/*
app.get('/login',(req,res)=>{
	db.collection('quotes').find().toArray((err, result) => {
		if (err) return console.log(err)
		res.send(result);
	});
});*/

initDb(function(err){
	console.log('Error connecting to Mongo. Message:\n'+err);
});
