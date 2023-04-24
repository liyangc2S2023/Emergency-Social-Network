const axios = require('axios');
const User = require('../../model/user');
const config = require('../../config');
const DB = require('../../database');

const PORT = 3000;
const HOST = `http://localhost:${PORT}/api/v1`;

// Initiate Server
const APP = require('../../backend');

const { server, setupRestfulRoutes } = new APP();

let userToken;
let db;
let supplyId;
let exchangeId;

beforeAll(async () => {
  setupRestfulRoutes();
  server.listen(PORT);
  // await mongoose.disconnect();
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

  const supply = {
    name: 'test_supply',
    quantity: 10,
    category: 'test_category',
  };
  await axios.post(`${HOST}/supplies`, supply, {
    headers: { authorization: userToken },
  }).then((response) => {
    supplyId = response.data.data._id;
  });

  const exchangeSample = {
    requester: 'admin1',
    dealer: 'test1',
    supplyReq: 'test_supply',
    supplyDeal: 'apple',
    quantityReq: '1',
    quantityDeal: '1',
    supplyID: supplyId,
    categoryReq: 'C1',
    categoryDeal: 'test_category',
    status: 'pending',
  };
  await axios.post(`${HOST}/exchange/${exchangeSample.requester}/${exchangeSample.dealer}`, exchangeSample, {
    headers: { authorization: userToken },
  }).then((response) => {
    exchangeId = response.data.data._id;
  });
});

test('can post a supply', async () => {
  const supply = {
    name: 'test_supply',
    quantity: 10,
    category: 'test_category',
  };
  await axios.post(`${HOST}/supplies`, supply, {
    headers: { authorization: userToken },
  }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can get all supplies', async () => {
  await axios.get(`${HOST}/supplies`, {
    headers: { authorization: userToken },
  }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can update a supply', async () => {
  const updatedSupply = {
    name: 'supply',
    quantity: 1,
    category: 'category',
  };
  await axios.post(`${HOST}/supplies/${supplyId}`, updatedSupply, {
    headers: { authorization: userToken },
  }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can post an exchange', async () => {
  const exchange = {
    requester: 'admin1',
    dealer: 'test1',
    supplyReq: 'test_supply',
    supplyDeal: 'apple',
    quantityReq: '1',
    quantityDeal: '1',
    supplyID: supplyId,
    categoryReq: 'C1',
    categoryDeal: 'test_category',
    status: 'pending',
  };
  await axios.post(`${HOST}/exchange/${exchange.requester}/${exchange.dealer}`, exchange, {
    headers: { authorization: userToken },
  }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can rejet an exchange', async () => {
  await axios.post(`${HOST}/exchange/rejection`, { id: exchangeId }, {
    headers: { authorization: userToken },
  }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can cancel an exchange', async () => {
  await axios.post(`${HOST}/exchange/cancellation`, { id: exchangeId }, {
    headers: { authorization: userToken },
  }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can accept an exchange', async () => {
  await axios.post(`${HOST}/exchange/acception`, { id: exchangeId }, {
    headers: { authorization: userToken },
  }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });

  const exchangeSample = {
    requester: 'admin1',
    dealer: 'test1',
    supplyReq: 'test_supply',
    supplyDeal: 'apple',
    quantityReq: '1',
    quantityDeal: '100',
    supplyID: supplyId,
    categoryReq: 'C1',
    categoryDeal: 'test_category',
    status: 'pending',
  };
  await axios.post(`${HOST}/exchange/${exchangeSample.requester}/${exchangeSample.dealer}`, exchangeSample, {
    headers: { authorization: userToken },
  }).then((response) => {
    exchangeId = response.data.data._id;
  });

  await axios.post(`${HOST}/exchange/acception`, { id: exchangeId }, {
    headers: { authorization: userToken },
  }).then((response) => {
    expect(response.data.success).toBe(false);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});
