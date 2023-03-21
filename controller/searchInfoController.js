const Message = require('../model/message');
const User = require('../model/user');

class searchInfoController {
  static async searchByUsername(username) {
    return User.searchByUsername(username);
  }

  static async searchByStatus(status) {
    return User.searchByStatus(status);
  }

  static async searchByAnnouncement() {
    // TODO: implement this function after setting up the announcement model.
    // return Announcement.searchByAnnouncement(keywords);
  }

  static async searchByPublicMessage(keywords) {
    return Message.searchByPublicMessage(keywords);
  }

  static async searchByPrivateMessage(keywords) {
    return Message.searchByPrivateMessage(keywords);
  }
}

module.exports = searchInfoController;
