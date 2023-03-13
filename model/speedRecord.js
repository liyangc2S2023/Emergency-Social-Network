const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const axios = require('axios');
const setupDB = require('../database');
const SuspendFlag = require('../routes/common/suspendFlag');
const config = require('../config');

const speedRecordSchema = new mongoose.Schema({
  testID: { type: String, required: true },
  testTime: { type: Number, required: true },
  testType: { type: String, required: true },
});

const speedRecordTable = mongoose.model('speedRecord', speedRecordSchema);

class SpeedRecord {
  static instance;

  mongoServer;

  constructor() {
    this.mongoServer = null;
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new SpeedRecord();
    return this.instance;
  }

  async setTestDB(type = 'in-memory') {
    if (type === 'in-memory') {
      this.mongoServer = await MongoMemoryServer.create();
      const mongoUri = this.mongoServer.getUri();
      await mongoose.disconnect();
      await mongoose.connect(mongoUri);
      console.log('Connect to In-Memory TestDB');
    }
  }

  async resetDB() {
    await mongoose.disconnect();
    await this.mongoServer.stop();
    await setupDB();
  }

  static async testPostRequests(duration, interval, req) {
    // start post test
    const { testID } = SuspendFlag.getInstance();
    console.log('post test start');
    SpeedRecord.sendPost(req.token, testID);
    SuspendFlag.getInstance().testPost = setInterval(
      SpeedRecord.sendPost,
      interval,
      req.token,
      testID,
    );
    // stop post test
    const stopPost = setTimeout(() => {
      clearInterval(SuspendFlag.getInstance().testPost);
      SuspendFlag.getInstance().testPost = null;
      console.log('post test finished');
      // start get test
      SpeedRecord.testGetRequests(duration * config.GET_TEST_PERCENTAGE, interval, req);
    }, duration * config.POST_TEST_PERCENTAGE);
    SuspendFlag.getInstance().stopPost = stopPost;
  }

  static async testGetRequests(duration, interval, req) {
    // start get test
    const { testID } = SuspendFlag.getInstance();
    console.log('get test start');
    SpeedRecord.sendGet(req.token, testID);
    SuspendFlag.getInstance().testGet = setInterval(
      SpeedRecord.sendGet,
      interval,
      req.token,
      testID,
    );
    // stop get test
    const stopGet = setTimeout(() => {
      clearInterval(SuspendFlag.getInstance().testGet);
      SuspendFlag.getInstance().testGet = null;
      console.log('get test finished');
    }, duration);
    SuspendFlag.getInstance().stopGet = stopGet;
  }

  static async getAll() {
    return speedRecordTable.find();
  }

  static async sendPost(token, testID) {
    // if post requests exceed the limit, stop test
    SuspendFlag.getInstance().postNum += 1;
    if (SuspendFlag.getInstance().postNum >= config.POST_REQUEST_LIMIT) {
      await SuspendFlag.getInstance().stopSuspend(1);
      setTimeout(() => { SpeedRecord.getInstance().resetDB(); }, config.SPEED_TEST_WAIT_TIME);
    }
    const time = Date.now();
    // send post request via axios
    axios.post(
      'http://localhost:3000/api/v1/messages',
      {
        sender: 'test',
        reciver: 'test',
        status: 'undefined',
        content: 'it is a 20 char str!',
      },
      { headers: { authorization: token, testid: testID } },
    )
      .then(() => {
        const testTime = Date.now() - time;
        speedRecordTable.create({ testID, testTime, testType: 'post' });
      }).catch((err) => {
        console.log(err.toString());
      });
  }

  static async sendGet(token, testID) {
    const time = Date.now();
    // send get request via axios
    axios.get(
      'http://localhost:3000/api/v1/messages',
      { headers: { authorization: token, testid: testID } },
    )
      .then(() => {
        const testTime = Date.now() - time;
        speedRecordTable.create({ testID, testTime, testType: 'get' });
      }).catch((err) => {
        console.log(err.toString());
      });
  }

  static async getPerformanceResult(testID) {
    let postPerformance = 0; let getPerformance = 0;
    // calculate post performance
    const postRecords = await speedRecordTable.find({ testType: 'post', testID });
    postRecords.forEach((record) => {
      postPerformance += record.testTime;
    });
    // calculate get performance
    const getRecords = await speedRecordTable.find({ testType: 'get', testID });
    getRecords.forEach((record) => {
      getPerformance += record.testTime;
    });
    return {
      postPerformance: 1000 / (postPerformance / postRecords.length),
      getPerformance: 1000 / (getPerformance / getRecords.length),
    };
  }
}

module.exports = SpeedRecord;
