const getUsers = require("./db").getUsers;

module.exports = {auth};

async function auth(username,password){
    let user = await authenticate({ username, password });
    return user;
}
async function authenticate({ username, password }) {
    let users = getUsers();
    let user = users.find(u => u.username === username && u.password === password);
    console.log(user)
    if (user) {
        let { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}