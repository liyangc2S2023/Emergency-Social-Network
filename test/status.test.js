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
  expect(await Status.getStatus('rui')).toBe(undefined);
});

test('test get user status', async () => {
  // the update status should also return new status
  const res = await Status.updateUserStatus('lisa', 'ok');
  expect(res).toBe('ok');
  expect(await Status.getStatus('lisa')).toBe('ok');
});

test('test no user history status', async () => {
  expect((await Status.getHistoryStatus('rui')).length).toBe(0);
});

test('test getHistoryStatus status', async () => {
  const username = 'noreen';
  const ohterName = 'lisa';
  await Status.updateUserStatus(username, 'ok');
  expect((await Status.getHistoryStatus(username)).length).toBe(1);
  await Status.updateUserStatus(username, 'help');
  expect((await Status.getHistoryStatus(username)).length).toBe(2);
  await Status.updateUserStatus(username, 'emergency');
  await Status.updateUserStatus(ohterName, 'emergency');
  const statusHistory = await Status.getHistoryStatus(username);
  expect(statusHistory.length).toBe(3);
  expect(statusHistory[0].status).toBe('emergency');
  expect(statusHistory[1].status).toBe('help');
  expect(statusHistory[2].status).toBe('ok');
});

test('test search information by typing "status" in privateMessge and get no result', async () => {
  // search for a not valid username
  const res = await Status.searchHistoryStatus('app');
  expect(res).toEqual([]);
});

test('test search information by typing "status" in privateMessge and get a matching status list of receiver', async () => {
  // add status history of a certain user (receiver in private Caht)
  await Status.updateUserStatus('noreenGoodUserUser', 'ok');
  expect((await Status.searchHistoryStatus('noreenGoodUserUser')).length).toBe(1);
  await Status.updateUserStatus('noreenGoodUserUser', 'help');
  expect((await Status.searchHistoryStatus('noreenGoodUserUser')).length).toBe(2);
  await Status.updateUserStatus('noreenGoodUserUser', 'emergency');
  expect((await Status.searchHistoryStatus('noreenGoodUserUser')).length).toBe(3);
  await Status.updateUserStatus('lisa', 'emergency');
  await Status.updateUserStatus('lisa', 'help');
  await Status.updateUserStatus('lisa', 'ok');
  const result = await Status.searchHistoryStatus('lisa');
  expect(result[0].status).toBe('ok');
  expect(result[1].status).toBe('help');
});

test('test search information by private message and get no more than 10 matching results', async () => {
  // add ten more private messages
  await Status.updateUserStatus('noreen', 'ok');
  await Status.updateUserStatus('noreen', 'emergency');
  await Status.updateUserStatus('noreen', 'help');
  await Status.updateUserStatus('noreen', 'help');
  await Status.updateUserStatus('noreen', 'emergency');
  await Status.updateUserStatus('noreen', 'emergency');
  await Status.updateUserStatus('noreen', 'emergency');
  await Status.updateUserStatus('noreen', 'ok');
  await Status.updateUserStatus('noreen', 'ok');
  await Status.updateUserStatus('noreen', 'emergency');
  //more than 10
  await Status.updateUserStatus('noreen', 'help');
  await Status.updateUserStatus('noreen', 'ok');
  await Status.updateUserStatus('noreen', 'help');
  const res = await Status.searchHistoryStatus('noreen');
  expect(res.length).toBe(10);
});

