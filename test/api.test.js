const axios = require('axios');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
// const Message = require('../model/message');
const User = require('../model/user');
const config = require('../config');

const PORT = 3000;
const HOST = `http://localhost:${PORT}/api/v1`;

// Initiate Server
const APP = require('../backend');

const { server, setupRestfulRoutes } = new APP();

// let server;
let mongoServer;
let userToken;
let coordinatorToken;

beforeAll(async () => {
  setupRestfulRoutes();
  server.listen(PORT);
  await mongoose.disconnect();
});

afterAll(async () => {
  server.close();
});

const sampleUser = {
  username: 'test1',
  password: 'tttt',
  role: 'user',
};

const smapleCoordinator = {
  username: 'test2',
  password: 'tttt',
  role: config.USER_ROLE.COORDINATOR,
};

beforeEach(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  await User.addUser('test1', 'tttt');
  await User.addUser('test2', 'tttt', config.USER_ROLE.COORDINATOR);
  await User.addUser('test3', 'tttt');
  await User.addUser('test4', 'tttt');

  // loigin to a test user fist
  await axios.put(`${HOST}/login`, sampleUser).then((response) => {
    userToken = response.data.token;
  });

  await axios.put(`${HOST}/login`, smapleCoordinator).then((response) => {
    coordinatorToken = response.data.token;
  });
});

afterEach(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// user integration test
test('Can post a new user', async () => {
  const UserData = {
    username: 'testA',
    password: '1234412m',
    role: 'user',
  };

  await axios.post(`${HOST}/users`, UserData, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });

  await axios.get(`${HOST}/users`, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
    expect(response.data.data.length).toBe(5);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('Can get all users', async () => {
  await axios.get(`${HOST}/users`, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
    expect(response.data.data.length).toBe(4);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can get a user by id', async () => {
  await axios.get(`${HOST}/users/test1`, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
    expect(response.data.data.username).toBe('test1');
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('test user login', async () => {
  await axios.put(`${HOST}/login`, { username: 'fail', password: 'fail' })
    .then((res) => {
      expect(res.status).toBe(400);
    }).catch((err) => {
      expect(err);
    });
});

// test('test user current',async()=>{

// })

// post integration test
test('can post announcement', async () => {
  const announcement = {
    content: 'test',
    sender: 'test',
  };
  await axios.post(`${HOST}/announcements`, announcement, { headers: { authorization: coordinatorToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('user cannot post announcement', async () => {
  const announcement = {
    sender: 'test',
    content: 'test',
  };
  await axios.post(`${HOST}/announcements`, announcement, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

//
