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
    return null;
  }

  static async getLatestAnnouncement() {
    const message = await AnnouncementTable.find()
      .sort({ timestamp: -1 })
      .limit(1);
    return message[0];
  }
}

module.exports = Announcement;
