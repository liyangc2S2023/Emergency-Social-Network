const config = require('../config');
const SuspendFlag = require('../routes/common/suspendFlag');
const DB = require('../database');

class SpeedRecordController {
  testDB;

  static async startTest(testID) {
    // set suspend flag
    await SuspendFlag.getInstance().startSuspend(testID);
    // set test database
    console.log(`start speed test: ${testID}`);
    await new DB('production').disconnect();
    this.testDB = new DB('test');
    await this.testDB.connect();
  }

  static async stopTest() {
    await new Promise((resolve) => {
      setTimeout(resolve, config.SPEED_TEST_WAIT_TIME);
    }).then(async () => {
      await this.testDB.disconnect();
      await new DB('production').connect();
    });
  }
}

module.exports = SpeedRecordController;
