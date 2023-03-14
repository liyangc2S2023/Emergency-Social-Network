const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Message = require('../model/message');

let mongoServer;

beforeEach(async () => {
  // assuming mongoose@6.x
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  await Message.addMessage('t1', 't2', 'status', 'content');
  await Message.addMessage('t1', 't2', 'status', 'content');
  await Message.addMessage('t1', 'all', 'status', 'content');
});

afterEach(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test('test add messages', async () => {
  let result = await Message.getAll();
  expect(result.length).toBe(3);
  await Message.addMessage('t1', 't2', 'status', 'content');
  result = await Message.getAll();
  expect(result.length).toBe(4);
});

test('test get by sender', async () => {
  expect((await Message.getBySender('t1')).length).toBe(3);
  expect((await Message.getBySender('t2')).length).toBe(0);

  await Message.addMessage('t2', 't1', 'status', 'change');
  expect((await Message.getBySender('t1')).length).toBe(3);
  expect((await Message.getBySender('t2')).length).toBe(1);

  await Message.addMessage('t2', 'all', 'status', 'change');
  expect((await Message.getBySender('t1')).length).toBe(3);
  expect((await Message.getBySender('t2')).length).toBe(2);
});

test('test get by receiver', async () => {
  expect((await Message.getMessageByReceiverOrRoom('t1')).length).toBe(0);
  expect((await Message.getMessageByReceiverOrRoom('t2')).length).toBe(2);
  expect((await Message.getMessageByReceiverOrRoom('all')).length).toBe(1);

  await Message.addMessage('t2', 't1', 'status', 'change');
  expect((await Message.getMessageByReceiverOrRoom('t1')).length).toBe(1);
  expect((await Message.getMessageByReceiverOrRoom('t2')).length).toBe(2);
  expect((await Message.getMessageByReceiverOrRoom('all')).length).toBe(1);

  await Message.addMessage('t2', 'all', 'status', 'toAll');
  expect((await Message.getMessageByReceiverOrRoom('t1')).length).toBe(1);
  expect((await Message.getMessageByReceiverOrRoom('t2')).length).toBe(2);
  expect((await Message.getMessageByReceiverOrRoom('all')).length).toBe(2);
});

test('test get by private', async () => {
  expect((await Message.getPrivateMessagesBetween('t1', 't2')).length).toBe(2);

  await Message.addMessage('t2', 't1', 'status', 'change');
  expect((await Message.getPrivateMessagesBetween('t1', 't2')).length).toBe(3);
  expect((await Message.getPrivateMessagesBetween('t1', 't3')).length).toBe(0);

  await Message.addMessage('t1', 't3', 'status', 'change');
  expect((await Message.getPrivateMessagesBetween('t1', 't2')).length).toBe(3);
  expect((await Message.getPrivateMessagesBetween('t1', 't3')).length).toBe(1);
});

test('test get latest message between two users', async () => {
  let result = (await Message.getLatestMessageBetween('t1', 't2')).content;
  expect(result).toBe('content');

  await Message.addMessage('t2', 't1', 'status', 'change');
  result = (await Message.getLatestMessageBetween('t1', 't2')).content;
  expect(result).toBe('change');

  result = (await Message.getLatestMessageBetween('t1', 't3'));
  expect(result).toBe(undefined);

  await Message.addMessage('t1', 't3', 'status', 'hello');
  result = (await Message.getLatestMessageBetween('t1', 't2')).content;
  expect(result).toBe('change');

  result = (await Message.getLatestMessageBetween('t1', 't3')).content;
  expect(result).toBe('hello');
});
