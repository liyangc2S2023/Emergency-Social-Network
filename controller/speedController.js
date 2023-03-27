const config = require('../config');
const SpeedRecord = require('../model/speedRecord');
const SuspendFlag = require('../routes/common/suspendFlag');

class SpeedRecordController {
  static async startTest(testID) {
    // set suspend flag
    await SuspendFlag.getInstance().startSuspend(testID);
    // set test database
    await SpeedRecord.getInstance().setTestDB();
  }

  static async stopTest() {
    // reset database
    setTimeout(
      () => { SpeedRecord.getInstance().resetDB(); },
      config.SPEED_TEST_WAIT_TIME,
    );
  }
}

module.exports = SpeedRecordController;
