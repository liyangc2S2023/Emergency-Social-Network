const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const FixOrder = require('../model/fixOrder');

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

test('test no fix order status', async () => {
  expect(await FixOrder.getFixOrderStatus('app')).toBe('normal');
});

test('test get fix order status when a new user comes', async () => {
  // the create status should also return new status
  const res = await FixOrder.createFixOrder('SingingintheRain', 'no power for 1 hr', ' NASA Research Park, Building 23 Moffett Field, CA 94035', 'needFix');
  expect(res.status).toBe('needFix');
  expect(await FixOrder.getFixOrderStatus('SingingintheRain')).toBe('needFix');
});

test('test get fix order status of a old user', async () => {
  // the create status should also return new status
  const res = await FixOrder.createFixOrder('noreen', 'no power for 1 hr', ' NASA Research Park, Building 23 Moffett Field, CA 94035', 'needFix');
  expect(res.status).toBe('needFix');
  expect(await FixOrder.getFixOrderStatus('noreen')).toBe('needFix');
});

test('update fix order by electrician', async () => {
  // the create status should also return new status
  const res = await FixOrder.createFixOrder('Gaya', 'no power for 1 hr', ' NASA Research Park, Building 23 Moffett Field, CA 94035', 'needFix');
  expect(res.status).toBe('needFix');
  expect(await FixOrder.getFixOrderStatus('Gaya')).toBe('needFix');
  await FixOrder.updateFixOrderByElectrian('Gaya', 'Zuse', 'fixing');
  expect(await FixOrder.getFixOrderStatus('Gaya')).toBe('fixing');
});

test('test get unfix order', async () => {
  await FixOrder.createFixOrder('Star Trek', 'no power for 1 hr', ' NASA Research Park, Building 23 Moffett Field, CA 94035', 'needFix');
  await FixOrder.createFixOrder('John Wick', 'power restore', '', 'normal');
  await FixOrder.createFixOrder('Hyun Bin', 'power died', 'Mountain View', 'needFix');
  await FixOrder.createFixOrder('Jennifer Lawrence', 'OMG', 'Sunnyvale', 'needFix');
  await FixOrder.createFixOrder('James Bond', '', '', 'needFix');
  await FixOrder.updateFixOrderByElectrian('noreen', 'tom cruise', 'fixing');
  await FixOrder.createFixOrder('James Bond', '', '', 'normal');
  await FixOrder.updateFixOrderByElectrian('Jennifer Lawrence', 'noreen', 'normal');
  const res = await FixOrder.getUnfixOrders();
  expect(res.length).toBe(5);
});
