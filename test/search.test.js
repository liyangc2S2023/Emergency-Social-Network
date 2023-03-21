const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const User = require('../model/user');

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

test('test search information by username and get no result', async () => {
  const res = await User.searchByUsername('app');
  expect(res).toEqual([]);
});

test('test search information by username and get a matching user list', async () => {
  await User.addUser('GoodUser', '1234');
  expect((await User.searchByUsername('GoodUser')).length).toBe(1);
  await User.addUser('noreenGoodUser', '1234');
  expect((await User.searchByUsername('GoodUser')).length).toBe(2);
  await User.addUser('lisaGoodUser', '1234');
  expect((await User.searchByUsername('GoodUser')).length).toBe(3);
  await User.addUser('linxiBadUser', '1234');
  expect((await User.searchByUsername('GoodUser')).length).toBe(3);
  const res = await User.searchByUsername('GoodUser');
  expect(res[0].username).toBe('GoodUser');
  expect(res[1].username).toBe('lisaGoodUser');
  expect(res[2].username).toBe('noreenGoodUser');
  // TODO: test the result order by online
});
