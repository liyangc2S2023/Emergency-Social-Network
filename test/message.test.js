const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Message = require('../model/message');

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

test('test add messages', async () => {
  await Message.addMessage('t1', 't2', 's', 'content');
  await Message.addMessage('t1', 't2', 's', 'content');
  let result = await Message.getAll();
  expect(result.length).toBe(2);
  await Message.addMessage('t1', 't2', 's', 'content');
  result = await Message.getAll();
  expect(result.length).toBe(3);
});

test('test get by sender', async () => {
  expect((await Message.getBySender('t1')).length).toBe(3);
  expect((await Message.getBySender('t2')).length).toBe(0);
});

test('test get by reciever', async () => {
  expect((await Message.getByreceiver('t1')).length).toBe(0);
  expect((await Message.getByreceiver('t2')).length).toBe(3);
});
