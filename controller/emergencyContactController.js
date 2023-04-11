const EmergencyContact = require('../model/emergencyContact');

class EmergencyContactController {
  static async getEmergencyContact(username) {
    return EmergencyContact.getEmergencyContact(username);
  }

  static async addEmergencyContacts(username, contact) {
    return EmergencyContact.addEmergencyContacts(username, contact);
  }

  static async deleteEmergencyContact(username, contact) {
    return EmergencyContact.deleteEmergencyContact(username, contact);
  }
}

module.exports = EmergencyContactController;
