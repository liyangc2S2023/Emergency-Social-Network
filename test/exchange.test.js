const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const exchange = require('../model/exchange');
const supply = require('../model/supply');

let mongoServer;

beforeEach(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  const supplyItem = await supply.createSupply('apple', 1, 'category1', 'admin1');
  const exchange1 = {
    requester: 'admin2',
    dealer: 'admin1',
    supplyReq: 'banana',
    supplyDeal: 'apple',
    quantityReq: '1',
    quantityDeal: '1',
    supplyID: supplyItem.id,
    categoryReq: 'C1',
    categoryDeal: 'C2',
    status: 'pending',
  };
  await exchange.createExchange(exchange1);
  const exchange2 = {
    requester: 'admin3',
    dealer: 'admin1',
    supplyReq: 'water',
    supplyDeal: 'apple',
    quantityReq: '1',
    quantityDeal: '3',
    supplyID: supplyItem.id,
    categoryReq: 'C1',
    categoryDeal: 'C2',
    status: 'pending',
  };
  await exchange.createExchange(exchange2);
});

afterEach(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test('test get all exchanges by User', async () => {
  const supplyItem = await supply.createSupply('apple', 1, 'category1', 'admin1');
  let result = await exchange.getExchangesByUser('admin1');
  expect(result.length).toBe(2);
  const exchange3 = {
    requester: 'admin2',
    dealer: 'admin1',
    supplyReq: 'banana',
    supplyDeal: 'apple',
    quantityReq: '1',
    quantityDeal: '1',
    supplyID: supplyItem.id,
    categoryReq: 'C1',
    categoryDeal: 'C2',
    status: 'pending',
  };
  await exchange.createExchange(exchange3);
  result = await exchange.getExchangesByUser('admin1');
  expect(result.length).toBe(3);
  const exchange4 = {
    requester: 'admin2',
    dealer: 'admin3',
    supplyReq: 'banana',
    supplyDeal: 'apple',
    quantityReq: '1',
    quantityDeal: '1',
    supplyID: supplyItem.id,
    categoryReq: 'C1',
    categoryDeal: 'C2',
    status: 'pending',
  };
  await exchange.createExchange(exchange4);
  result = await exchange.getExchangesByUser('admin1');
  expect(result.length).toBe(3);
});

test('test change exchange status', async () => {
  let result = await exchange.getExchangesByUser('admin1');
  expect(result[0].status).toBe('pending');
  await exchange.changeExchangeStatus(result[0].id, 'approved');
  result = await exchange.getExchangesByUser('admin1');
  expect(result[0].status).toBe('approved');
});

test('test can not change exchange status', async () => {
  await exchange.changeExchangeStatus('64369119db9116be6f28d5c5', 'approved');
  const result = await exchange.getExchangesByUser('admin1');
  expect(result[0].status).toBe('pending');
});

test('test get exchange by id', async () => {
  const result = await exchange.getExchangesByUser('admin1');
  const result2 = await exchange.getExchangesById(result[0].id);
  expect(result2.status).toBe('pending');
});
