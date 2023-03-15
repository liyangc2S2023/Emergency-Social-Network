const Status = require('../model/status');
const User = require('../model/user');

class StatusController {
  // cache status in user model to improve performance
  // will return the updated status
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
