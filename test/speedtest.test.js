const { default: axios } = require('axios');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const SpeedRecord = require('../model/speedRecord');
const SuspendFlag = require('../routes/common/suspendFlag')
let mongoServer;

beforeAll(async () => {
  // assuming mongoose@6.x
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test('test suspend flag',()=>{
    SuspendFlag.getInstance().startSuspend("123")
    expect(SuspendFlag.getInstance().isSuspend).toBe(true)
    expect(SuspendFlag.getInstance().testID).toBe("123")
})