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
  await Message.addMessage('t1', 't2', 'status', 'content');
  await Message.addMessage('t1', 't2', 'status', 'content');
  await Message.addMessage('t1', 'all', 'status', 'content');
  let result = await Message.getAll();
  expect(result.length).toBe(3);
  await Message.addMessage('t1', 't2', 'status', 'content');
  result = await Message.getAll();
  expect(result.length).toBe(4);
});

test('test get by sender', async () => {
  expect((await Message.getBySender('t1')).length).toBe(4);
  expect((await Message.getBySender('t2')).length).toBe(0);
});

test('test get by receiver', async () => {
  expect((await Message.getMessageByReceiverOrRoom('t1')).length).toBe(0);
  expect((await Message.getMessageByReceiverOrRoom('t2')).length).toBe(3);
  expect((await Message.getMessageByReceiverOrRoom('all')).length).toBe(1);
  expect((await Message.getMessageByReceiverOrRoom('t3')).length).toBe(0);
});

test('test get by private', async () => {
  expect((await Message.getPrivateMessagesBetween('t1', 't2')).length).toBe(3);
});

test('test get latest message between two users', async () => {
  expect(await Message.getLatesMessageBetween('t1', 't2').toBe('content'));
  expect(await Message.getLatesMessageBetween('t1', 't3').toBe(undefined));
});
