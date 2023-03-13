const config = require('../config');
const SpeedRecord = require('../model/speedRecord');
const SuspendFlag = require('../routes/common/suspendFlag');

class SpeedRecordController {
  static async startTest(req, duration, interval) {
    // create test id
    const testID = `${req.username}-${Date.now()}`;
    // set suspend flag
    await SuspendFlag.getInstance().startSuspend(duration, interval, testID);
    // set test database
    await SpeedRecord.getInstance().setTestDB();
    // test post requests
    await SpeedRecord.testPostRequests(duration, interval, req);
    // wait for test completion, then stop test
    const normalStop = setTimeout(
      SpeedRecordController.stopTest,
      duration + config.SPEED_TEST_WAIT_TIME,
      SuspendFlag.getInstance().exitStatus,
    );
    SuspendFlag.getInstance().normalStop = normalStop;
  }

  static async stopTest(exitStatus) {
    // calcuate test results
    const result = await SpeedRecordController.getPerformanceResult(
      SuspendFlag.getInstance().testID,
    );
    SuspendFlag.getInstance().postPerformance = result.postPerformance;
    SuspendFlag.getInstance().getPerformance = result.getPerformance;
    // reset suspend
    await SuspendFlag.getInstance().stopSuspend(exitStatus);
    // reset database
    setTimeout(
      () => { SpeedRecord.getInstance().resetDB(); },
      config.SPEED_TEST_WAIT_TIME,
    );
  }

  static async get() {
    return SpeedRecord.getAll();
  }

  static async getPerformanceResult(testID) {
    return SpeedRecord.getPerformanceResult(testID);
  }
}

module.exports = SpeedRecordController;
