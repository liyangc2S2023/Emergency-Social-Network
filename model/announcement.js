const mongoose = require('mongoose');
const { USER_ROLE } = require('../config');

const announcementSchema = new mongoose.Schema({
  content: { type: String, required: true },
  sender: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, required: true },
});

const AnnouncementTable = mongoose.model('Announcement', announcementSchema);

class Announcement {
  static async getAll() {
    return AnnouncementTable.find();
  }

  static async getBySender(sender) {
    return AnnouncementTable.find({ sender });
  }

  static async addAnnouncement(sender, content, role) {
    if (role === USER_ROLE.COORDINATOR) {
      return AnnouncementTable.create(
        {
          sender,
          content,
        },
      );
    }
    return false;
  }

  static async getLatestAnnouncement() {
    const message = await AnnouncementTable.find()
      .sort({ timestamp: -1 })
      .limit(1);
    return message[0];
  }

  static async searchByAnnouncement(keywords, page = 0, limit = 10) {
    // '|' for matching either values, 'i' for case insensitive
    const regex = new RegExp(keywords.join('|'), 'i');
    const announcements = await AnnouncementTable.find({ content: regex })
      .sort({ timestamp: -1 })
      .skip(page * limit)
      .limit(limit);
    return announcements;
  }
}

module.exports = Announcement;
