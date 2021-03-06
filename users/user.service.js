﻿//const users = [{ id: 1, username: 'test', password: 'test', firstName: 'Test', lastName: 'User' },{ id: 2, username: 'test2', password: '123', firstName: 'Test', lastName: 'User' }];
const users = [];

module.exports = {
    authenticate,
    getAll
};

async function authenticate({ username, password }) {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

async function getAll() {
    return users.map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
    });
}
