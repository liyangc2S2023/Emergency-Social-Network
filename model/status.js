const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
  username: { type: String, required: true },
  status: { type: String, require: true, default: 'undefined' },
  timestamp: { type: Date, default: Date.now, require: true },
});

// Define a model for the Status collection using the schema
const StatusTable = mongoose.model('Status', statusSchema);

class Status {
  // create a new object of user's status
  static async updateUserStatus(username, status) {
    const newDate = new Date();
    const res = await StatusTable.create({ username, status, timestamp: newDate });
    return res.status;
  }

  // get the stats of the current user stored in the database
  static async getStatus(username) {
    const status = await StatusTable.find({ username }).sort({ timestamp: -1 }).limit(1);
    return status.length > 0 ? status[0].status : undefined;
  }

  // get the history of status for the current user
  static async getHistoryStatus(username) {
    return StatusTable.find({ username }).sort({ timestamp: -1 });
  }

  static async searchHistoryStatus(receiver, page = 0, limit = 10) {
    const status = await StatusTable.find({ username: receiver })
      .sort({ timestamp: -1 })
      .skip(page * limit)
      .limit(limit);
    return status;
  }
}

module.exports = Status;
