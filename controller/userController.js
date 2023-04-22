const config = require('../config');
const User = require('../model/user');

class UserController {
  static async getAll() {
    return User.getAll();
  }

  static async getOne(username) {
    return User.getOne(username);
  }

  static async addUser(username, password, role) {
    return User.addUser(username.toLowerCase(), password.toLowerCase(), role);
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

  static async getUserRole(username) {
    return User.getUserRole(username);
  }

  static async updateRole(username){
    return User.updateRole(username);
  }
  static async isActive(username) {
    var user = await User.getOne(username)
    if (user) {
      return user.active;
    }
    else{
      return true;
    }
  }
  
  static async setActive(username) {
    return User.setActive(username);
  }

  static async setInactive(username) {
    return User.setInactive(username);
  }

  static async updateInfo(username, newUsername, password, active, role) {
    return User.updateInfo(username, newUsername, password, active, role);
  }

  static async getAllInactive() {
    return User.getAllInactive();
  }

  static async checkAtLeastOneAdmin(username) {
    if((await User.getOne(username)).role === config.USER_ROLE.ADMIN){
      var allUsers = (await User.getAll()).filter(user => user.active).filter(user => user.role === config.USER_ROLE.ADMIN);
      if(allUsers.length === 1){
        return false;
      }
      else{
        return true;
      }
    }
    else{
      return true
    }
  }

  // static async updateCurrentStatus(username, status) {
  //   return User.updateCurrentStatus(username, status);
  // }
}

// const userController = new UserController();

module.exports = UserController;
