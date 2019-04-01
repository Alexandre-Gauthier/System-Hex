const client = require('mongodb').MongoClient;
const config = require("./config");

let _db = null;

module.exports = class MongoDB{
	static connectMongo(){
		if ( _db ) return Promise.resolve(_db)
        return client.connect(config.connectionString)
            .then(db => _db = db)
	}

	initDb(callback){
		if(_db){
			console.warn("Trying to init DB again!");
			return callback(null,_db);
		}

		client.connect(config.connectionString)
            .then(db => {
				_db = db.db('system-hex');
				console.log('Connected to MongoDB at: %s', config.connectionString);
				return callback(null,_db);
			})
			.catch((err)=>{
				return callback(err);
			})

	}

	getDb(){
		assert.ok(_db, "Db has not been initialized. Please called init first.");
		return _db;
	}

	getUsers(callback){
		if(_db){
			_db.collection('users').find().toArray((err, result) => {
				if (err) return console.log(err)
				callback(result)
			});
		}else{
			console.log('No DB initiate')
		}
	}

	getSystems(userID,callback){
		if(_db){
			_db.collection('systems').find({userId: userID},{systems:1}).toArray((err, result) => {
				if (err) return console.log(err);
				callback(result[0]);
			});
		}
	}

	getSystem(userID,systemID,callback){
		if(_db){
			let sysID = parseInt(systemID);
			_db.collection('systems').findOne({userId: userID,'systems.id':sysID},{projection:{_id: 0,systems:{$elemMatch: {id:sysID}}}},(err, result) => {
				if (err) return console.log(err);
				callback(result.systems[0])
			});
		}
	}

	updateSystem(userID,newSystem,callback){
		if(_db){
			_db.collection('systems').replaceOne({userId: userID},newSystem,(err,result)=>{
				if (err) return console.log(err);
				callback(result);
			});
		}
	}
}