const { verify } = require("jsonwebtoken");
const { render } = require("pug");
const User = require("../model/user")

class LoginLogoutController {

    async login(username) {
        // get token & set user status as online
        var token = await User.login(username)
        // get all users
        var userList = await User.getAll()
        return { token, userList }
    }

    async logout(username) {
        // user status as offline
        return await User.logout(username)
    }
}

const loginLogoutController = new LoginLogoutController()

module.exports = loginLogoutController
