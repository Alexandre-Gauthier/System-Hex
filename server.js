const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

const basicAuth = require('./_helpers/basic-auth');
const errorHandler = require('./_helpers/error-handler');

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
	});
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

initDb(function(err){
	console.log('Error connecting to Mongo. Message:\n'+err);
});

// use basic HTTP auth to secure the api
app.use(basicAuth);

// api routes
app.use('/users', require('./users/users.controller'));

// global error handler
app.use(errorHandler);


// start server
const server = app.listen(port, function () {
	console.log('Server listening on port ' + port);
});

app.get('/server',(req,res)=>{
	db.collection('quotes').find().toArray((err, result) => {
		if (err) return console.log(err)
		res.send(result);
	});
});
