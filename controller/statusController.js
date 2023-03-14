const Status = require('../model/status');
const User = require('../model/user');

class StatusController {
  static async updateUserStatus(username, status) {
    await User.updateCurrentStatus(username, status);
    return Status.updateUserStatus(username, status);
  }

  static async getStatus(username) {
    return Status.getStatus(username);
  }

  static async getHistoryStatus(username) {
    return Status.getHistoryStatus(username);
  }
}

module.exports = StatusController;
