const client = require('mongodb').MongoClient;
const config = require("./config");

let _db;

module.exports = {
    getDb,
	initDb,
	getUsers
};

const initDb = (callback)=> {
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

const getDb = () =>{
    assert.ok(_db, "Db has not been initialized. Please called init first.");
    return _db;
}

const getUsers = () =>{
	let users = [];
	if(_db){
		_db.collection('users').find().toArray((err, result) => {
			if (err) return console.log(err)
			users = result;
		});
	}
	return users;
}