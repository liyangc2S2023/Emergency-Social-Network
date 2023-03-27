const Announcement = require('../model/announcement');

class AnnouncementController {
  static async getAll() {
    return Announcement.getAll();
  }

  static async getBySender(sender) {
    return Announcement.getBySender(sender);
  }

  static async addAnnouncement(sender, content, role) {
    return Announcement.addAnnouncement(sender, content, role);
  }

  static async getLastestAnnouncement() {
    return Announcement.getLatestAnnouncement();
  }
}

module.exports = AnnouncementController;
