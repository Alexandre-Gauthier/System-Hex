const client = require('mongodb').MongoClient;
const config = require("./config");

let _db;
let users = [];

module.exports = {
    getDb,
	initDb,
	getUsers
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
	console.log('db_getUsers',_db)
	if(_db){
		console.log('db_getUsers_Inside')
		_db.collection('users').find().toArray((err, result) => {
			if (err) return console.log(err)
			callback(result)
		});
	}
}