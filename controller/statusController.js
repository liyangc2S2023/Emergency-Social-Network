const Status = require('../model/status');
const User = require('../model/user');

class StatusController {
  static async createUserStatus(username, status) {
    return Status.createUserStatus(username, status);
  }

  static async getStatus(username) {
    const newStatus = await Status.getStatus(username);
    return newStatus;
  }

  static async getHistoryStatus(username) {
    return Status.getHistoryStatus(username);
  }

  static async addStatus(username, status) {
    return User.addStatus(username, status);
  }
}

module.exports = StatusController;
