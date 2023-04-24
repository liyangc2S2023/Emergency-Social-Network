const config = require('../config');
const EmergencyRecord = require('../model/emergencyRecord');

class EmergencyRecordController {
  static async getInitStatus(name) {
    const result = await EmergencyRecord.getRecordByName(name);
    if (result) {
      if (result.type === config.EMERGENCY_TYPE.REQUEST) {
        return { status: config.EMERGENCY_CITIZEN_STATUS.REQUESTING, record: result };
      }
      if (result.type === config.EMERGENCY_TYPE.RESPONSE) {
        return { status: config.EMERGENCY_CITIZEN_STATUS.OFFERING, record: result };
      }
    }
    return { status: config.EMERGENCY_CITIZEN_STATUS.NONE };
  }

  static async getById(id) {
    return EmergencyRecord.getEmergencyRecordById(id);
  }

  static async getAllHelpRequest() {
    return EmergencyRecord.getHelpRequest();
  }

  static async updateLocation(req, id, location) {
    const result = await EmergencyRecord.updateRequestLocationById(id, location);
    req.io.emit('updateLocation', id, location);
    return result;
  }

  static async startReqShareAndSaveRecord(req, name, location, formResult) {
    const newRecord = await EmergencyRecord.addHelpRequest(name, location, formResult);
    // eslint-disable-next-line no-underscore-dangle
    req.io.emit('startLocationShare', newRecord._id, location, 'request', formResult);
    return newRecord;
  }

  static async getHelpResponseOf(id) {
    return EmergencyRecord.getHelpResponseByTarget(id);
  }

  static async receiveLocationShare(req, id) {
    const result = await EmergencyRecord.finishRecordById(id);
    req.io.emit('stopLocationShare', id);
    return result;
  }

  static async cancelLocationShare(req, id) {
    const result = await EmergencyRecord.deleteEmergencyRecordById(id);
    req.io.emit('stopLocationShare', id);
    return result;
  }

  static async startResShareAndSaveRecord(req, name, location, target) {
    const newRecord = await EmergencyRecord.addHelpResponse(name, location, target);
    // eslint-disable-next-line no-underscore-dangle
    req.io.emit('startLocationShare', newRecord._id, location, 'respond');
    return newRecord;
  }
}

module.exports = EmergencyRecordController;
