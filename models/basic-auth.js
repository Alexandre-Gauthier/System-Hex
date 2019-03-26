const cDB = require("./db");
const db = new MongoDB();

module.exports = {auth};

function auth(username,password,callback){
    let user = authenticate( username, password, callback );
    return user;
}

function authenticate( username, password, callback ) {
    db.getUsers((users)=>{
        let user = users.find(u => u.username === username && u.password === password);
        if (user) {
            let { password, ...userWithoutPassword } = user;
            callback(userWithoutPassword)
            //return userWithoutPassword;
        }
    });

}