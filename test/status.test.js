const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Status = require('../model/status');

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

test('test no user status', async () => {
  expect((await Status.getStatus('rui')).status).toBe(undefined);
});

test('test get user status', async () => {
  await Status.createUserStatus('lisa', 'ok');
  expect((await Status.getStatus('lisa')).status).toBe('ok');
});

test('test no user history status', async () => {
  expect((await Status.getHistoryStatus('rui')).length).toBe(0);
});

test('test getHistoryStatus status', async () => {
  const username = 'noreen';
  const ohterName = 'lisa';
  await Status.createUserStatus(username, 'ok');
  expect((await Status.getHistoryStatus(username)).length).toBe(1);
  await Status.updateUserStatus(username, 'help');
  expect((await Status.getHistoryStatus).length).toBe(2);
  await Status.updateUserStatus(username, 'emergency');
  await Status.updateUserStatus(ohterName, 'emergency');
  const statusHistory = await Status.getHistoryStatus(username);
  expect(statusHistory.length).toBe(3);
  expect(statusHistory[0].status).toBe('emergency');
  expect(statusHistory[1].status).toBe('help');
  expect(statusHistory[2].status).toBe('ok');
});
