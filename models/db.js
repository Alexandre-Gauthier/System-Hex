const client = require('mongodb').MongoClient;
const config = require("./config");


module.exports = class MongoDB{
	static connectMongo(){
		if ( this._db ) return Promise.resolve(this._db)
        return client.connect(config.connectionString)
            .then(db => this._db = db)
	}

	initDb(callback){
		if(this._db){
			console.warn("Trying to init DB again!");
			return callback(null,this._db);
		}

		client.connect(config.connectionString)
            .then(db => {
				this._db = db.db('system-hex');
				console.log('Connected to MongoDB at: %s', config.connectionString);
				return callback(null,this._db);
			})

		// client.connect(config.connectionString, function(err, conn) {
		// 	if (err) {return callback(err);}


		// 	this._db = conn.db('system-hex');

		// 	console.log('Connected to MongoDB at: %s', config.connectionString);
		// 	return callback(null,this._db);
		// });
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