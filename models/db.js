const client = require('mongodb').MongoClient;
const config = require("./config");

let _db;

module.exports = class MongoDB{
	constructor(){
		this._db;
	}

	initDb(callback){
		if(this._db){
			console.warn("Trying to init DB again!");
			return callback(null, this._db);
		}

		client.connect(config.connectionString, function(err, conn) {
			if (err) {return callback(err);}

			this._db = conn.db('system-hex');

			console.log('Connected to MongoDB at: %s', config.connectionString);
			return callback(null,this._db);
		});
	}

	getDb(){
		assert.ok(this._db, "Db has not been initialized. Please called init first.");
		return this._db;
	}

	getUsers(callback){
		if(this._db){
			this._db.collection('users').find().toArray((err, result) => {
				if (err) return console.log(err)
				callback(result)
			});
		}
	}

	getSystems(userID,callback){
		if(this._db){
			this._db.collection('systems').find({userId: userID},{systems:1}).toArray((err, result) => {
				if (err) return console.log(err);
				callback(result[0]);
			});
		}
	}

	getSystem(userID,systemID,callback){
		if(this._db){
			this._db.collection('systems').find({userId: userID},{systems:1}).toArray((err, result) => {
				if (err) return console.log(err);
				let response = null;
				result[0].systems.forEach(system => {
					if(system.id == systemID){
						response = system;
					}
				});
				callback(response);
			});
		}
	}
}

function initDb(callback) {
	if(_db){
		console.warn("Trying to init DB again!");
        return callback(null, _db);
    }

	client.connect(config.connectionString, function(err, conn) {
		if (err) {return callback(err);}

		_db = conn.db('system-hex');

		console.log('Connected to MongoDB at: %s', config.connectionString);
		return callback(null,_db);
	});

};

function getDb(){
    assert.ok(_db, "Db has not been initialized. Please called init first.");
    return _db;
}

function getUsers(callback){
	if(_db){
		_db.collection('users').find().toArray((err, result) => {
			if (err) return console.log(err)
			callback(result)
		});
	}
}

function getSystems(userID,callback){
	if(_db){
		_db.collection('systems').find({userId: userID},{systems:1}).toArray((err, result) => {
			if (err) return console.log(err);
			callback(result[0]);
		});
	}
}

function getSystem(userID,systemID,callback){
	if(_db){
		_db.collection('systems').find({userId: userID},{systems:1}).toArray((err, result) => {
			if (err) return console.log(err);
			let response = null;
			result[0].systems.forEach(system => {
				if(system.id == systemID){
					response = system;
				}
			});
			callback(response);
		});
	}
}