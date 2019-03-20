const client = require('mongodb').MongoClient;
const config = require("./config");

let _db;
let users = [];

module.exports = {
    getDb,
	initDb,
	getUsers,
	getSystems
};

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
			callback(result);
		});
	}
}

function getSystem(userID,systemID,callback){
	if(_db){
		_db.collection('systems').find({userId: userID,"systems.id":systemID},{"systems.$":1}).toArray((err, result) => {
			if (err) return console.log(err);
			callback(result);
		});
	}
}