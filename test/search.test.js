const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Message = require('../model/message');
const User = require('../model/user');

let mongoServer;

beforeEach(async () => {
  // assuming mongoose@6.x
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  // add two private messages
  await Message.addMessage('lisa', 'noreen', 'ok', 'hello');
  await Message.addMessage('noreen', 'lisa', 'ok', 'world');
  // add two public messages
  await Message.addMessage('lisa', 'all', 'help', 'hi all');
  await Message.addMessage('noreen', 'all', 'emergency', 'hello all');
});

afterEach(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test('test search information by username and get no result', async () => {
  // search for a not valid username
  const res = await User.searchByUsername('app');
  expect(res).toEqual([]);
});

test('test search information by username and get a matching user list', async () => {
  // add some matching users and search
  await User.addUser('GoodUser', '1234');
  expect((await User.searchByUsername('GoodUser')).length).toBe(1);
  await User.addUser('noreenGoodUser', '1234');
  expect((await User.searchByUsername('GoodUser')).length).toBe(2);
  await User.addUser('lisaGoodUser', '1234');
  expect((await User.searchByUsername('GoodUser')).length).toBe(3);
  // add a not matching user and search
  await User.addUser('linxiBadUser', '1234');
  expect((await User.searchByUsername('GoodUser')).length).toBe(3);
  // result should be in alphabetical order
  const res = await User.searchByUsername('GoodUser');
  expect(res[0].username).toBe('GoodUser');
  expect(res[1].username).toBe('lisaGoodUser');
  expect(res[2].username).toBe('noreenGoodUser');
  // TODO: test the result order by online
});

test('test search information by status and get no result', async () => {
  // search for a not existing status
  const res = await User.searchByStatus('noneStatus');
  expect(res).toEqual([]);
});

test('test search information by status and get a matching user list', async () => {
  // add some users with status ok and search status ok
  await User.addUser('noreen', '1234');
  await User.updateCurrentStatus('noreen', 'ok');
  expect((await User.searchByStatus('ok')).length).toBe(1);
  await User.addUser('lisa', '1234');
  await User.updateCurrentStatus('lisa', 'ok');
  expect((await User.searchByStatus('ok')).length).toBe(2);
  await User.addUser('linxi', '1234');
  await User.updateCurrentStatus('linxi', 'ok');
  expect((await User.searchByStatus('ok')).length).toBe(3);
  // add a user with status help and search status ok
  await User.addUser('joseph', '1234');
  await User.updateCurrentStatus('joseph', 'help');
  expect((await User.searchByStatus('ok')).length).toBe(3);
  expect((await User.searchByStatus('help')).length).toBe(1);
  // result should be in alphabetical order
  const res = await User.searchByStatus('ok');
  expect(res[0].username).toBe('linxi');
  expect(res[1].username).toBe('lisa');
  expect(res[2].username).toBe('noreen');
  // TODO: test the result order by online
});

test('test search information by public message and get no result', async () => {
  // if keywords are empty, it will return all public messages.
  const keywords = [];
  expect((await Message.searchByPublicMessage(keywords)).length).toBe(2);
  // if no existing public messages matches one of the keywords, it should return empty result.
  keywords[0] = 'bye';
  keywords[1] = 'good';
  expect(await Message.searchByPublicMessage(keywords)).toEqual([]);
});

test('test search information by public message and get matching messages', async () => {
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
