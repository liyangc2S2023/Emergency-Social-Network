const axios = require('axios');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
// const Message = require('../model/message');
const User = require('../model/user');

const PORT = 3000;
const HOST = `http://localhost:${PORT}/api/v1`;

// Initiate Server
const APP = require('../backend');

const { server, setupRestfulRoutes } = new APP();

// let server;
let mongoServer;
let token;

beforeAll(async () => {
  setupRestfulRoutes();
  server.listen(PORT);
  await mongoose.disconnect();
});

afterAll(async () => {
  server.close();
});

beforeEach(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  await User.addUser('test1', 'tttt');
  await User.addUser('test2', 'tttt');
  await User.addUser('test3', 'tttt');
  await User.addUser('test4', 'tttt');

  // loigin to a test user fist
  const sampleUser = { username: 'test1', password: 'tttt' };
  await axios.put(`${HOST}/login`, sampleUser).then((response) => {
    token = response.data.token;
  });
});

afterEach(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

const testUserData = {
  username: 'testA',
  password: '1234412m',
  role: 'user',
};

test('Can get all users', async () => {
  await axios.get(`${HOST}/users`, { headers: { authorization: token } }).then((response) => {
    expect(response.status).toBe(200);
    expect(response.data.data.length).toBe(4);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('Can post a new user', async () => {
  console.log('test');
  await axios.post(`${HOST}/users`, testUserData, { headers: { authorization: token } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });

  await axios.get(`${HOST}/users`, { headers: { authorization: token } }).then((response) => {
    expect(response.status).toBe(200);
    expect(response.data.data.length).toBe(5);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});
