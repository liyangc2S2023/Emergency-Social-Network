const axios = require('axios');
// const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
// const Message = require('../model/message');
const User = require('../model/user');
const config = require('../config');
const DB = require('../database');

const PORT = 3000;
const HOST = `http://localhost:${PORT}/api/v1`;

// Initiate Server
const APP = require('../backend');

const { server, setupRestfulRoutes } = new APP();

// let server;
// let mongoServer;
let userToken;
let db;

beforeAll(async () => {
  setupRestfulRoutes();
  server.listen(PORT);
  db = new DB('test');
  await db.connect();
});

afterAll(async () => {
  await db.disconnect();
  await server.close();
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
  // await dbConnection.db.dropDatabase();
  await db.freshTables();

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

// map integration test
test('can post emergency requests', async () => {
  const record = {
    location: 'loc',
    formResult: 'form',
  };
  await axios.post(`${HOST}/emergencyRequests`, record, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can get emergency requests', async () => {
  const record = {
    location: 'loc',
    formResult: 'form',
  };
  await axios.post(`${HOST}/emergencyRequests`, record, { headers: { authorization: userToken } });

  await axios.get(`${HOST}/emergencyRequests`, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can get emergency requests by id', async () => {
  const record = {
    location: 'loc',
    formResult: 'form',
  };
  const res = await axios.post(`${HOST}/emergencyRequests`, record, { headers: { authorization: userToken } });

  await axios.get(`${HOST}/emergencyRequests/${res.data.data._id}`, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can done emergency requests by id', async () => {
  const record = {
    location: 'loc',
    formResult: 'form',
  };
  const res = await axios.post(`${HOST}/emergencyRequests`, record, { headers: { authorization: userToken } });

  await axios.put(`${HOST}/emergencyRequests/${res.data.data._id}/done`, {}, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can put emergency requests by id', async () => {
  const record = {
    location: 'loc',
    formResult: 'form',
  };
  const res = await axios.post(`${HOST}/emergencyRequests`, record, { headers: { authorization: userToken } });

  await axios.put(`${HOST}/emergencyRequests/${res.data.data._id}`, {
    location: res.data.data.location,
  }, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can delete emergency requests by id', async () => {
  const record = {
    location: 'loc',
    formResult: 'form',
  };
  const res = await axios.post(`${HOST}/emergencyRequests`, record, { headers: { authorization: userToken } });

  await axios.delete(
    `${HOST}/emergencyRequests/${res.data.data._id}`,
    { headers: { authorization: userToken } },
  ).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can post emergency Responses', async () => {
  const record = {
    location: 'loc',
    target: 'target',
  };
  await axios.post(`${HOST}/emergencyResponses`, record, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can get emergency Responses by id', async () => {
  const record = {
    location: 'loc',
    target: 'target',
  };
  const res = await axios.post(`${HOST}/emergencyResponses`, record, { headers: { authorization: userToken } });

  await axios.get(`${HOST}/emergencyResponses/target/${res.data.data._id}`, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can done emergency Responses by id', async () => {
  const record = {
    location: 'loc',
    target: 'target',
  };
  const res = await axios.post(`${HOST}/emergencyResponses`, record, { headers: { authorization: userToken } });

  await axios.put(`${HOST}/emergencyResponses/${res.data.data._id}/done`, {}, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can put emergency Responses by id', async () => {
  const record = {
    location: 'loc',
    target: 'target',
  };
  const res = await axios.post(`${HOST}/emergencyResponses`, record, { headers: { authorization: userToken } });

  await axios.put(`${HOST}/emergencyResponses/${res.data.data._id}`, {
    location: res.data.data.location,
  }, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can delete emergency Responses by id', async () => {
  const record = {
    location: 'loc',
    target: 'target',
  };
  const res = await axios.post(`${HOST}/emergencyResponses`, record, { headers: { authorization: userToken } });

  await axios.delete(
    `${HOST}/emergencyResponses/${res.data.data._id}`,
    { headers: { authorization: userToken } },
  ).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});
