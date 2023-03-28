class SuspendFlag {
  static instance;

  isSuspend;

  testID;

  constructor(isSuspend) {
    this.isSuspend = isSuspend;
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new SuspendFlag(false);
    return this.instance;
  }

  startSuspend(testID) {
    this.isSuspend = true;
    this.testID = testID;
  }

  // eslint-disable-next-line class-methods-use-this
  stopSuspend() {
    SuspendFlag.getInstance().isSuspend = false;
    SuspendFlag.getInstance().testID = '';
  }
}

module.exports = SuspendFlag;
