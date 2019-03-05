const getUsers = require("./db").getUsers;

module.exports = {auth};

function auth(username,password,callback){
    console.log('auth')
    let user = authenticate( username, password, callback );
    return user;
}

function authenticate( username, password, callback ) {
    console.log('authenticate',username,password);
    getUsers((users)=>{
        console.log(users)
        let user = users.find(u => u.username === username && u.password === password);
        console.log('authenticate',users)
        if (user) {
            let { password, ...userWithoutPassword } = user;
            callback(userWithoutPassword)
            //return userWithoutPassword;
        }
    });

}