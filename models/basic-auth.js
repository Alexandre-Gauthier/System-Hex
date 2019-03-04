const getUsers = require("./db").getUsers;

module.exports = {auth};

async function auth(username,password){
    const user = await authenticate({ username, password });
    return user;
}
async function authenticate({ username, password }) {
    let users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    console.log(user)
    if (user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}