const User = require("../model/user")

class UserController {

    async getAll() {
        return await User.getAll()
    }

    async getOne(username) {
        return await User.getOne(username)
    }

    async addUser(username, password) {
        return await User.addUser(username.toLowerCase(), password.toLowerCase())
    }

    async verifyUser(username, password) {
        return User.checkPassword(username, password)
    }

    async login(username) {
        // get token & set user status as online
        return await User.login(username)
    }

    async logout(username) {
        // user status as offline
        return await User.logout(username)
    }
}

const userController = new UserController()

module.exports = userController
