const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  status: { type: String, require: true, default: 'undefined' },
  timestamp: { type: Date, default: Date.now, require: true },
});

// Define a model for the Status collection using the schema
const StatusTable = mongoose.model('Status', statusSchema);

class Status {
  // create a new object of user's status
  static async createUserStatus(username, status) {
    const newDate = new Date();
    return StatusTable.create({ username, status, timestamp: newDate });
  }

  // get the stats of the current user stored in the database
  static async getStatus(username) {
    return StatusTable.find({ username }).sort({ timestamp: -1 }.limit(1));
  }

  // get the history of status for the current user
  static async getHistoryStatus(username) {
    return StatusTable.find({ username }).sort({ timestamp: -1 });
  }
}

module.exports = Status;
