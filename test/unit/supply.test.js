const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Supply = require('../../model/supply');

let mongoServer;

beforeEach(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  await Supply.createSupply('apple', 1, 'category1', 'admin1');
  await Supply.createSupply('banana', 2, 'category2', 'admin2');
  await Supply.createSupply('aplle2', 0, 'category1', 'admin1');
});

afterEach(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test('get all supplies', async () => {
  const result = await Supply.getAllsupplies();
  expect(result.length).toBe(3);
});

test('get all remaing supplies', async () => {
  let result = await Supply.getAllRemainingSupplies();
  expect(result.length).toBe(2);
  await Supply.createSupply('apple', 1, 'category1', 'admin1');
  result = await Supply.getAllRemainingSupplies();
  expect(result.length).toBe(3);
  await Supply.createSupply('apple', 0, 'category1', 'admin1');
  result = await Supply.getAllRemainingSupplies();
  expect(result.length).toBe(3);
});

test('get supplies by id', async () => {
  const supply = await Supply.createSupply('apple', 5, 'category1', 'admin1');
  const result = await Supply.getSupplyById(supply.id);
  expect(result.name).toBe('apple');
  expect(result.quantity).toBe(5);
  expect(result.category).toBe('category1');
  expect(result.owner).toBe('admin1');
});

test('can change supply quantity', async () => {
  const supply = await Supply.createSupply('apple2', 5, 'category1', 'admin2');
  await Supply.changeSupplyQuantity(supply.id, 10);
  const result = await Supply.getSupplyById(supply.id);
  expect(result.quantity).toBe(10);
});

test('can not change supply quantity', async () => {
  await Supply.changeSupplyQuantity('64369119db9116be6f28d5c5', 10);
  const result = await Supply.getSupplyById('64369119db9116be6f28d5c5');
  expect(result).toBe(null);
});

test('update supply', async () => {
  const supply = await Supply.createSupply('apple', 5, 'category1', 'admin1');
  await Supply.updateSupply(supply.id, 'apple2', 10, 'category2');
  const result = await Supply.getSupplyById(supply.id);
  expect(result.name).toBe('apple2');
  expect(result.quantity).toBe(10);
  expect(result.category).toBe('category2');
  await Supply.updateSupply('64369119db9116be6f28d5c5', 'apple2', 10, 'category2');
  const result2 = await Supply.getSupplyById('64369119db9116be6f28d5c5');
  expect(result2).toBe(null);
});
