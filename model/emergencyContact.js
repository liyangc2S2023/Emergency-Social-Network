const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
  username: { type: String, required: true },
  contact: { type: String, require: true },
  timestamp: { type: Date, default: Date.now, require: true },
});

// Define a model for the Status collection using the schema
const EmergencyContactsTable = mongoose.model('EmergencyContact', emergencyContactSchema);

class EmergencyContacts {
  // add another user to this uer's emergencyContacts list
  static async addEmergencyContact(username, usernameOther, timestamp = Date.now()) {
    // check if the user is adding himself as a contact
    if (username === usernameOther) {
      return undefined;
    }

    // check if the contact already exists
    const exist = await EmergencyContactsTable.find({ username, contact: usernameOther });
    if (exist.length > 0) {
      return EmergencyContactsTable.updateOne({ username, contact: usernameOther }, { timestamp });
    }

    return EmergencyContactsTable.create({ username, contact: usernameOther, timestamp });
  }

  // get the emergencyContacts of the current user stored in the database
  static async getEmergencyContact(username) {
    return EmergencyContactsTable.find({ username }).sort({ timestamp: -1 });
  }

  // delete the emergencyContacts of the current user given the usernameOther
  static async deleteEmergencyContact(username, usernameOther) {
    await EmergencyContactsTable.deleteOne({ username, contact: usernameOther });
  }
}

module.exports = EmergencyContacts;
