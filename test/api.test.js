const axios = require('axios');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
// const Message = require('../model/message');
const User = require('../model/user');
const config = require('../config');
// const db = require('../database');

const PORT = 3000;
const HOST = `http://localhost:${PORT}/api/v1`;

// Initiate Server
const APP = require('../backend');
const { USER_STATUS } = require('../config');

const { server, setupRestfulRoutes } = new APP();

// let server;
let mongoServer;
let userToken;
let coordinatorToken;
let dbConnection;

beforeAll(async () => {
  setupRestfulRoutes();
  server.listen(PORT);
  // await mongoose.disconnect();
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  const { connection } = mongoose;
  dbConnection = connection;
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
  await dbConnection.db.dropDatabase();

  // await db.connect(mongoUri, '');
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

afterAll(async () => {
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
    .catch((err) => {
      expect(err.response.status).toBe(400);
    });
});

test('test user current', async () => {
  let newToken;
  await User.addUser('testusercurrent', '12345');
  // add a current user
  await axios.put(`${HOST}/login`, { username: 'testusercurrent', password: '12345' }).then((response) => {
    newToken = response.data.token;
  });

  await axios.get(`${HOST}/users/current`, { headers: { authorization: newToken } })
    .then((res) => {
      expect(res.data.data.username).toBe('testusercurrent');
    });
});

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

test('can change the status of user', async () => {
  const statusChange = {
    username: sampleUser.username,
    status: USER_STATUS.OK,
  };
  await axios.post(`${HOST}/status`, statusChange, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can post a public message', async () => {
  const message = {
    sender: 'test',
    content: 'test',
    status: USER_STATUS.OK,
    receiver: 'all',
  };
  await axios.post(`${HOST}/messages`, message, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can get message between two user', async () => {
  await axios.get(`${HOST}/messages/private/:${sampleUser.username}/:${smapleCoordinator.username}`, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can get message by sender', async () => {
  await axios.get(`${HOST}/messages/:${sampleUser.username}`, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can get all message', async () => {
  await axios.get(`${HOST}/messages`, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can post private message', async () => {
  const message = {
    sender: 'test',
    content: 'test',
    status: USER_STATUS.OK,
    receiver: 'test2',
  };
  await axios.post(`${HOST}/messages/private/${message.sender}/${message.receiver}`, message, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

const queryFunction = async (query) => {
  await axios.get(`${HOST}/search`, {
    headers: { authorization: userToken },
    params: query,
  }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
};

test('can search content', async () => {
  const query = {
    context: 'username',
    criteria: 'test',
    sender: 'test',
    receiver: 'test',
    page: 0,
  };

  await queryFunction(query);
});

test('can query announcement', async () => {
  const query = {
    context: 'announcement',
    criteria: 'test',
    sender: 'test',
    receiver: 'test',
    page: 0,
  };

  await queryFunction(query);
});

test('can query public message', async () => {
  const query = {
    context: 'publicMessage',
    criteria: 'test',
    sender: 'test',
    receiver: 'test',
    page: 0,
  };

  await queryFunction(query);
});

test('can query private message', async () => {
  const query = {
    context: 'privateMessage',
    criteria: 'test',
    sender: 'test',
    receiver: 'test',
    page: 0,
  };

  await queryFunction(query);
});
