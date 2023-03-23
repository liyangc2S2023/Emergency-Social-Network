const Announcement = require('../model/announcement');
const User = require('../model/user');

class AnnouncementController {
  static async getAll() {
    return Announcement.getAll();
  }

  static async getBySender(sender) {
    return Announcement.getBySender(sender);
  }

  static async addAnnouncement(sender, content) {
    const role = User.getUserRole(sender);
    return Announcement.addMessage(sender, content, role);
  }

  static async getLastestAnnouncement() {
    return Announcement.getLatestAnnouncement();
  }
}

module.exports = AnnouncementController;
