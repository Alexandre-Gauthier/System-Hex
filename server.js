const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

const basicAuth = require('./_helpers/basic-auth');
const errorHandler = require('./_helpers/error-handler');

const MongoClient = require('mongodb').MongoClient
const config = require('./config');
let db = null;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// use basic HTTP auth to secure the api
app.use(basicAuth);

// api routes
app.use('/users', require('./users/users.controller'));

// global error handler
app.use(errorHandler);


// start server
const port = 3000;
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
	console.log(req.user.id);
	db.collection('quotes').find().toArray((err, result) => {
		if (err) return console.log(err)
		res.send(result);
	});
});
