const cryptoJS = require('crypto-js');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const User = require('../model/user');
const UserHelper = require('../model/helper/userHelper');
const config = require('../config');

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

test('test validate password', async () => {
  expect(UserHelper.validatePassword('', [])).toBe(false);
  expect(UserHelper.validatePassword('1', [])).toBe(false);
  expect(UserHelper.validatePassword('23', [])).toBe(false);
  expect(UserHelper.validatePassword(null, [])).toBe(false);
  expect(UserHelper.validatePassword('None', [])).toBe(true);
  expect(UserHelper.validatePassword('1234', [])).toBe(true);
});

test('test validate username', async () => {
  expect(UserHelper.validateUsername(null, [])).toBe(false);
  expect(UserHelper.validateUsername('', [])).toBe(false);
  expect(UserHelper.validateUsername('1', [])).toBe(false);
  expect(UserHelper.validateUsername('12', [])).toBe(false);
  expect(UserHelper.validateUsername('about', [])).toBe(false);
  expect(UserHelper.validateUsername('1234', [])).toBe(true);
});

test('test encrypt function', async () => {
  expect(UserHelper.encrypt('123')).toBe(cryptoJS.SHA256('123').toString());
});

test('test name rule check', async () => {
  expect(User.nameRuleCheck('test123', '1234').successflag).toBe(true);
  expect(User.nameRuleCheck('about', '123').successflag).toBe(false);
  expect(User.nameRuleCheck('1', '123').successflag).toBe(false);
  expect(User.nameRuleCheck('test', '1').successflag).toBe(false);
  expect(User.nameRuleCheck(null, '123').successflag).toBe(false);
  expect(User.nameRuleCheck('test', null).successflag).toBe(false);
});

test('test getAll', async () => {
  await User.addUser('test1', 'tttt');
  expect((await User.getAll()).length).toBe(1);
  await User.addUser('test2', 'tttt');
  expect((await User.getAll()).length).toBe(2);
  await User.addUser('test3', 'tttt');
  expect((await User.getAll()).length).toBe(3);
  await User.addUser('test4', 'tttt');
  expect((await User.getAll()).length).toBe(4);
});

test('test addUser', async () => {
  await User.addUser('test111', '1234');
  expect((await User.getOne('test111')).username).toBe('test111');
});

test('test usernameExists', async () => {
  expect((await User.usernameExists('tttt')).successFlag).toBe(true);
  await User.addUser('tttt', '1234');
  expect((await User.usernameExists('tttt')).successFlag).toBe(false);
});

test('test checkPassword', async () => {
  await User.addUser('testPassword', '123456');
  expect(await User.checkPassword('testPassword', '123456')).toBe(true);
  expect(await User.checkPassword('testPassword', '12345')).toBe(false);
});

test('test user login logout', async () => {
  await User.addUser('testLogin', '123456');
  expect((await User.getOne('testLogin')).online).toBe(false);
  await User.login('testLogin');
  expect((await User.getOne('testLogin')).online).toBe(true);
  await User.logout('testLogin');
  expect((await User.getOne('testLogin')).online).toBe(false);
});

test('test getOne', async () => {
  await User.addUser('testGetOne', '123456');
  expect((await User.getOne('testGetOne')).username).toBe('testGetOne');
});

test('test user role', async () => {
  await User.addUser('testUserRole', '123456', config.USER_ROLE.ADMIN);
  await User.addUser('testUserRole1', '123456', config.USER_ROLE.USER);
  expect((await User.getOne('testUserRole')).role).toBe(config.USER_ROLE.ADMIN);
  expect((await User.getOne('testUserRole1')).role).toBe(config.USER_ROLE.USER);
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
