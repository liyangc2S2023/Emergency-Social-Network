const mongoose = require('mongoose');

const emergencyGroupSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  initiator: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, required: true },
  isClosed: { type: Boolean, default: false, required: true },
});

const emergencyGroupMemberSchema = new mongoose.Schema({
  username: { type: String, required: true },
  groupName: { type: String, required: true },
});

const EmergencyGroupTable = mongoose.model('EmergencyGroup', emergencyGroupSchema);
const EmergencyGroupMemberTable = mongoose.model('EmergencyGroupMember', emergencyGroupMemberSchema);

class EmergencyGroup {
  static async createEmergencyGroup(groupName, username, members) {
    // do not create a group if it already exists
    const prev = await EmergencyGroupTable.findOne({ groupName });
    if (prev) {
      // create fails
      return undefined;
    }

    const group = await EmergencyGroupTable.create({ groupName, initiator: username });
    members.forEach(async (member) => {
      await EmergencyGroupMemberTable.create({ username: member, groupName });
    });
    await EmergencyGroupMemberTable.create({ username, groupName });
    return group;
  }

  static async getEmergencyGroup(groupName) {
    return EmergencyGroupTable.findOne({ groupName });
  }

  static async getEmergencyGroupByUser(username) {
    return EmergencyGroupMemberTable.find({ username });
  }

  static async getMembers(groupName) {
    return EmergencyGroupMemberTable.find({ groupName });
  }

  static async addMember(groupName, username) {
    // if the member already exists, do not add
    const res = await EmergencyGroupMemberTable.findOne({ username, groupName });
    if (res) {
      return undefined;
    }

    return EmergencyGroupMemberTable.create({ username, groupName });
  }

  static async isInitiator(groupName, username) {
    const res = await EmergencyGroupTable.findOne({ groupName, initiator: username });
    return !!res;
  }

  static async closeEmergencyGroup(groupName, username) {
    return EmergencyGroupTable.updateOne({ groupName, initiator: username }, { isClosed: true });
  }

  static async isClosed(groupName) {
    const res = await EmergencyGroupTable.findOne({ groupName, isClosed: true });
    return !!res;
  }
}

module.exports = EmergencyGroup;
