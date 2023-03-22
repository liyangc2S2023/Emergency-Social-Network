const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Message = require('../model/message');

let mongoServer;

beforeEach(async () => {
  // assuming mongoose@6.x
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  // add some private messages
  await Message.addMessage('t1', 't2', 'status', 'content');
  await Message.addMessage('t1', 't2', 'status', 'content');
  // add a public message
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

test('test user read message', async () => {
  await Message.addMessage('t2', 't1', 'status', 'content');
  const updateResult = await Message.userReadMessage('t1', 't2');
  expect(updateResult.modifiedCount).toBe(2);
  const result = (await Message.getPrivateMessagesBetween('t1', 't2'));
  // should read receiver message, not read sender message
  expect(result[1].isRead).toBe(true);
  expect(result[2].isRead).toBe(true);
  expect(result[0].isRead).toBe(false);
});

test('test get all unread messages', async () => {
  await Message.addMessage('t3', 't2', 'status', 'content');
  await Message.addMessage('t4', 't2', 'status', 'content');
  await Message.addMessage('t5', 't2', 'status', 'content');

  const result = await Message.getUserUnreadMessage('t2');
  expect(result.length).toBe(5);

  const updateResult = await Message.userReadMessage('t3', 't2');
  expect(updateResult.modifiedCount).toBe(1);

  const result2 = await Message.getUserUnreadMessage('t2');
  expect(result2.length).toBe(4);
});

test('test get all usernames with unread message', async () => {
  await Message.addMessage('t3', 't2', 'status', 'content');
  await Message.addMessage('t4', 't2', 'status', 'content');
  await Message.addMessage('t5', 't2', 'status', 'content');

  const result = await Message.getAllUsernamesWithUnreadMessage('t2');
  expect(result.size).toBe(4);

  const requiredElements = ['t1', 't3', 't4', 't5'];
  requiredElements.forEach((element) => {
    expect(result.has(element)).toBeTruthy();
  });

  const updateResult = await Message.userReadMessage('t3', 't2');
  expect(updateResult.modifiedCount).toBe(1);

  const result2 = await Message.getAllUsernamesWithUnreadMessage('t2');
  expect(result2.size).toBe(3);
});

test('test search information by public message and get no result', async () => {
  // if keywords are empty, it will return all public messages
  const keywords = [];
  // there should be 1 public message
  expect((await Message.searchByPublicMessage(keywords)).length).toBe(1);
  // if no existing public messages matches one of the keywords, it should return empty result.
  keywords[0] = 'hello';
  keywords[1] = 'bye';
  expect(await Message.searchByPublicMessage(keywords)).toEqual([]);
});

test('test search information by public message and get matching messages', async () => {
  // add two private messages
  await Message.addMessage('lisa', 'noreen', 'ok', 'hi');
  await Message.addMessage('noreen', 'lisa', 'ok', 'hello');
  // add two public messages
  await Message.addMessage('lisa', 'all', 'help', 'hi all');
  await Message.addMessage('noreen', 'all', 'emergency', 'hello all');
  // search for keywords: hi
  const keywords = [];
  keywords[0] = 'hi';
  expect((await Message.searchByPublicMessage(keywords)).length).toBe(1);
  let res;
  res = await Message.searchByPublicMessage(keywords);
  expect(res[0].content).toBe('hi all');
  expect(res[0].sender).toBe('lisa');
  // search for keywords: hello and hi
  keywords[1] = 'hello';
  expect((await Message.searchByPublicMessage(keywords)).length).toBe(2);
  res = await Message.searchByPublicMessage(keywords);
  // result should be ordered by timestamp
  expect(res[0].content).toBe('hello all');
  expect(res[0].sender).toBe('noreen');
  expect(res[1].content).toBe('hi all');
  expect(res[1].sender).toBe('lisa');
});

test('test search information by public message and get more than 10 matching results', async () => {
  // add ten more public messages
  await Message.addMessage('t2', 'all', 'ok', 'content');
  await Message.addMessage('t3', 'all', 'ok', 'content');
  await Message.addMessage('t4', 'all', 'ok', 'content');
  await Message.addMessage('t5', 'all', 'ok', 'content');
  await Message.addMessage('t6', 'all', 'ok', 'content');
  await Message.addMessage('t7', 'all', 'ok', 'content');
  await Message.addMessage('t8', 'all', 'ok', 'content');
  await Message.addMessage('t9', 'all', 'ok', 'content');
  await Message.addMessage('t10', 'all', 'ok', 'content');
  await Message.addMessage('t11', 'all', 'ok', 'content');
  // search for keywords: content
  const keywords = [];
  keywords[0] = 'content';
  // there are 11 matching public messages, but the result should only return 10 latest messages.
  const res = await Message.searchByPublicMessage(keywords);
  expect(res.length).toBe(10);
  // should be ordered by timestamp
  expect(res[0].sender).toBe('t11');
});

test('test search information by private message and get no result', async () => {
  // if keywords are empty, it will return all private messages
  const keywords = [];
  // there should be 2 private messages sent by t1
  expect((await Message.searchByPrivateMessage('t1', keywords)).length).toBe(2);
  // if no existing private messages matches one of the keywords, it should return empty result.
  keywords[0] = 'hello';
  keywords[1] = 'bye';
  expect(await Message.searchByPrivateMessage('t1', keywords)).toEqual([]);
});

test('test search information by private message and get matching messages', async () => {
  // add two private messages
  await Message.addMessage('lisa', 'noreen', 'ok', 'hi');
  await Message.addMessage('lisa', 'noreen', 'ok', 'hello');
  await Message.addMessage('noreen', 'lisa', 'ok', 'hi');
  await Message.addMessage('noreen', 'lisa', 'ok', 'hello');
  // add two public messages
  await Message.addMessage('lisa', 'all', 'help', 'hi all');
  await Message.addMessage('noreen', 'all', 'emergency', 'hello all');
  // search for keywords: hi
  const keywords = [];
  keywords[0] = 'hi';
  expect((await Message.searchByPrivateMessage('lisa', keywords)).length).toBe(1);
  let res;
  res = await Message.searchByPrivateMessage('lisa', keywords);
  expect(res[0].content).toBe('hi');
  expect(res[0].sender).toBe('lisa');
  // search for keywords: he and hi
  keywords[1] = 'he';
  expect((await Message.searchByPrivateMessage('lisa', keywords)).length).toBe(2);
  res = await Message.searchByPrivateMessage('lisa', keywords);
  // result should be ordered by timestamp
  expect(res[0].content).toBe('hello');
  expect(res[0].sender).toBe('lisa');
  expect(res[1].content).toBe('hi');
  expect(res[1].sender).toBe('lisa');
});

test('test search information by private message and get more than 10 matching results', async () => {
  // add ten more private messages
  await Message.addMessage('t1', 't2', 'ok', 'content');
  await Message.addMessage('t1', 't3', 'ok', 'content');
  await Message.addMessage('t1', 't4', 'ok', 'content');
  await Message.addMessage('t1', 't5', 'ok', 'content');
  await Message.addMessage('t1', 't6', 'ok', 'content');
  await Message.addMessage('t1', 't7', 'ok', 'content');
  await Message.addMessage('t1', 't8', 'ok', 'content');
  await Message.addMessage('t1', 't9', 'ok', 'content');
  await Message.addMessage('t1', 't10', 'ok', 'content');
  await Message.addMessage('t1', 't11', 'ok', 'content');
  // add a private message sent by t2
  await Message.addMessage('t2', 't1', 'ok', 'content');
  // search for keywords: content
  const keywords = [];
  keywords[0] = 'content';
  // there are 12 matching public messages, but the result should only return 10 latest messages.
  const res = await Message.searchByPrivateMessage('t1', keywords);
  expect(res.length).toBe(10);
  // should be ordered by timestamp
  expect(res[0].receiver).toBe('t11');
});
