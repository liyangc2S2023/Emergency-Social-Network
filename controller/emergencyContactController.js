const EmergencyContact = require('../model/emergencyContact');
const User = require('../model/user');

class EmergencyContactController {
  static async getEmergencyContact(username) {
    return EmergencyContact.getEmergencyContact(username);
  }

  static async addEmergencyContact(username, contact) {
    // check if contact exists
    const other = await User.getOne(contact);
    if (!other) {
      console.log('contact does not exist');
      return undefined;
    }

    return EmergencyContact.addEmergencyContact(username, contact);
  }

  static async deleteEmergencyContact(username, contact) {
    return EmergencyContact.deleteEmergencyContact(username, contact);
  }
}

module.exports = EmergencyContactController;
