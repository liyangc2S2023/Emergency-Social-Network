const mongoose = require('mongoose');
const { EMERGENCY_TYPE } = require('../config');

const emergencyRecord = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: Object, required: true },
  type: { type: String, required: true },
  formResult: { type: String, default: '' },
  target: { type: String, default: '' },
  isDone: { type: Boolean, default: false, required: true },
  timestamp: { type: Date, default: Date.now, required: true },
});

const EmergencyRecordTable = mongoose.model('EmergencyRecord', emergencyRecord);

class EmergencyRecord {
  static async getRecordByName(name) {
    return EmergencyRecordTable.findOne({ name, isDone: false });
  }

  static async getHelpRequest() {
    return EmergencyRecordTable.find({ type: EMERGENCY_TYPE.REQUEST, isDone: false });
  }

  static async getHelpResponseByTarget(id) {
    return EmergencyRecordTable.find({ type: EMERGENCY_TYPE.RESPONSE, isDone: false, target: id });
  }

  static async addHelpRequest(name, location, formResult) {
    return EmergencyRecordTable.create(
      {
        type: EMERGENCY_TYPE.REQUEST,
        name,
        location,
        formResult,
      },
    );
  }

  static async addHelpResponse(name, location, target) {
    return EmergencyRecordTable.create(
      {
        type: EMERGENCY_TYPE.RESPONSE,
        name,
        location,
        target,
      },
    );
  }

  static async getEmergencyRecordById(id) {
    return EmergencyRecordTable.findById(id);
  }

  static async finishRecordById(id) {
    await EmergencyRecordTable.updateMany({ target: id }, { isDone: true });
    return EmergencyRecordTable.findByIdAndUpdate(id, { isDone: true });
  }

  static async updateRequestLocationById(id, location) {
    return EmergencyRecordTable.findByIdAndUpdate(id, { location });
  }

  static async deleteEmergencyRecordById(id) {
    await EmergencyRecordTable.deleteMany({ target: id });
    return EmergencyRecordTable.findByIdAndDelete(id);
  }
}

module.exports = EmergencyRecord;
