const User = require('../model/user');

class UserController {
  static async getAll() {
    return User.getAll();
  }

  static async getOne(username) {
    return User.getOne(username);
  }

  static async addUser(username, password) {
    return User.addUser(username.toLowerCase(), password.toLowerCase());
  }

  static async verifyUser(username, password) {
    return User.checkPassword(username, password);
  }

  static async login(username) {
    // get token & set user status as online
    return User.login(username);
  }

  static async logout(username) {
    // user status as offline
    return User.logout(username);
  }
}

const userController = new UserController();

module.exports = userController;
