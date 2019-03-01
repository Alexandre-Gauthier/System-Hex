const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

const basicAuth = require('./_helpers/basic-auth');
const errorHandler = require('./_helpers/error-handler');

const MongoClient = require('mongodb').MongoClient
const config = require('./config');

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

	/*
if (mongoURL == null) {
	var mongoHost, mongoPort, mongoDatabase, mongoPassword, mongoUser;
	// If using plane old env vars via service discovery
	if (process.env.DATABASE_SERVICE_NAME) {
		var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
		mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'];
		mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'];
		mongoDatabase = process.env[mongoServiceName + '_DATABASE'];
		mongoPassword = process.env[mongoServiceName + '_PASSWORD'];
		mongoUser = process.env[mongoServiceName + '_USER'];

	// If using env vars from secret from service binding
	} else if (process.env.database_name) {
		mongoDatabase = process.env.database_name;
		mongoPassword = process.env.password;
		mongoUser = process.env.username;
		var mongoUriParts = process.env.uri && process.env.uri.split("//");
		if (mongoUriParts.length == 2) {
		mongoUriParts = mongoUriParts[1].split(":");
		if (mongoUriParts && mongoUriParts.length == 2) {
			mongoHost = mongoUriParts[0];
			mongoPort = mongoUriParts[1];
		}
		}
	}

	if (mongoHost && mongoPort && mongoDatabase) {
		mongoURLLabel = mongoURL = 'mongodb://';
		if (mongoUser && mongoPassword) {
		mongoURL += mongoUser + ':' + mongoPassword + '@';
		}
		// Provide UI label that excludes user id and pw
		mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
		mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
	}
}

var db = null,
	dbDetails = new Object();

var initDb = function(callback) {
	if (mongoURL == null) return;

	var mongodb = require('mongodb');
	if (mongodb == null) return;

	mongodb.connect(mongoURL, function(err, conn) {
		if (err) {
		callback(err);
		return;
		}

		db = conn;
		dbDetails.databaseName = db.databaseName;
		dbDetails.url = mongoURLLabel;
		dbDetails.type = 'MongoDB';

		console.log('Connected to MongoDB at: %s', mongoURL);
	});
};*/

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());


// use basic HTTP auth to secure the api
app.use(basicAuth);

// api routes
app.use('/users', require('./users/users.controller'));

// global error handler
app.use(errorHandler);

/*
initDb(function(err){
	console.log('Error connecting to Mongo. Message:\n'+err);
});

// start server
const server = app.listen(port, function () {
	console.log('Server listening on port ' + port);
});*/

MongoClient.connect(config, (err, client) => {
	if (err) return console.log(err)
	db = client.db('system-hex') // whatever your database name is
	if(db!= null){
		const server = app.listen(port, function () {
			console.log('Server listening on port ' + port);
		});
	}
})

app.get('/server',(req,res)=>{
	/*console.log('Hello there')
	res.send('Hello there')*/
	db.collection('quotes').find().toArray((err, result) => {
		if (err) return console.log(err)
		res.send(result);
	});
});
