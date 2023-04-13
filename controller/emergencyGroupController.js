const EmergencyGroup = require('../model/emergencyGroup');

class EmergencyGroupController {
  static async createEmergencyGroup(groupName, username, members) {
    return EmergencyGroup.createEmergencyGroup(groupName, username, members);
  }

  static async getEmergencyGroup(groupName) {
    return EmergencyGroup.getEmergencyGroup(groupName);
  }

  static async getEmergencyGroupByUser(username) {
    return EmergencyGroup.getEmergencyGroupByUser(username);
  }

  static async getOpenEmergencyGroupByUser(username) {
    return EmergencyGroup.getOpenEmergencyGroupByUser(username);
  }

  static async getMembers(groupName) {
    return EmergencyGroup.getMembers(groupName);
  }

  static async addMember(groupName, username) {
    return EmergencyGroup.addMember(groupName, username);
  }

  static async isInitiator(groupName, username) {
    return EmergencyGroup.isInitiator(groupName, username);
  }

  static async closeEmergencyGroup(groupName, username) {
    return EmergencyGroup.closeEmergencyGroup(groupName, username);
  }

  static async isClosed(groupName) {
    return EmergencyGroup.isClosed(groupName);
  }
}

module.exports = EmergencyGroupController;
