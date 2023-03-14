class SuspendFlag {
  static instance;

  isSuspend;

  duration;

  interval;

  testID;

  testGet;

  testPost;

  stopPost;

  stopGet;

  normalStop;

  postNum;

  // 0: normal, 1: POST Request Limit Rule, 2: explicitly stop
  exitStatus;

  postPerformance;

  getPerformance;

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

  startSuspend(duration, interval, testID) {
    this.isSuspend = true;
    this.duration = duration;
    this.interval = interval;
    this.testID = testID;
    this.postNum = 0;
    this.exitStatus = 0;
    this.getPerformance = 0;
    this.postPerformance = 0;
  }

  async stopSuspend(exitStatus = 0) {
    console.log(`suspend stop: ${exitStatus}`);
    this.duration = 0;
    this.interval = 0;
    this.testID = '';
    this.exitStatus = exitStatus;
    if (this.testPost) {
      await clearInterval(this.testPost);
      console.log('stop test post');
      this.testPost = null;
    }
    if (this.testGet) {
      await clearInterval(this.testGet);
      console.log('stop test get');
      this.testGet = null;
    }
    if (this.stopPost) {
      await clearInterval(this.stopPost);
      console.log('test get timeout stop');
      this.stopPost = null;
    }
    if (this.stopGet) {
      await clearInterval(this.stopGet);
      console.log('test post timeout stop');
      this.stopGet = null;
    }
    if (this.normalStop) {
      await clearInterval(this.normalStop);
      console.log('test normal stop timeout stop');
      this.normalStop = null;
    }
  }
}

module.exports = SuspendFlag;
