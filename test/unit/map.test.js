const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const EmergencyRecord = require('../../model/emergencyRecord');

let mongoServer;
let dbConnection;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  const { connection } = mongoose;
  dbConnection = connection;
});

beforeEach(async () => {
  await dbConnection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test('test add messages', async () => {
  await EmergencyRecord.addHelpRequest('test', { lat: 1, lng: 1 }, 'form');
  const query = await EmergencyRecord.getRecordByName('test');
  expect(query).not.toBe(null);
});

test('test get Record By Name', async () => {
  await EmergencyRecord.addHelpRequest('test', { lat: 1, lng: 1 }, 'form');
  const query = await EmergencyRecord.getRecordByName('test');
  expect(query).not.toBe(null);
});

test('test get help request', async () => {
  await EmergencyRecord.addHelpRequest('test', { lat: 1, lng: 1 }, 'form');
  const q1 = await EmergencyRecord.getHelpRequest();
  expect(q1.length).toBe(1);
  await EmergencyRecord.addHelpRequest('test', { lat: 1, lng: 1 }, 'form');
  await EmergencyRecord.addHelpRequest('test', { lat: 1, lng: 1 }, 'form');
  const q2 = await EmergencyRecord.getHelpRequest();
  expect(q2.length).toBe(3);
});

test('test add help response', async () => {
  await EmergencyRecord.addHelpResponse('test', { lat: 1, lng: 1 }, 'form');
  const result = await EmergencyRecord.getRecordByName('test');
  expect(result).not.toBe(null);
});

test('test get help response by target', async () => {
  await EmergencyRecord.addHelpResponse('test', { lat: 1, lng: 1 }, 'target');
  const result = await EmergencyRecord.getHelpResponseByTarget('target');
  expect(result.length).toBe(1);
});

test('test get emergency record by id', async () => {
  const result = await EmergencyRecord.addHelpResponse('test', { lat: 1, lng: 1 }, 'target');
  const query = EmergencyRecord.getEmergencyRecordById(result._id);
  expect(query).not.toBe(null);
});

test('test finish record by id', async () => {
  const result = await EmergencyRecord.addHelpResponse('test', { lat: 1, lng: 1 }, 'target');
  expect(result.isDone).toBe(false);
  await EmergencyRecord.finishRecordById(result._id);
  const query = await EmergencyRecord.getEmergencyRecordById(result._id);
  expect(query.isDone).toBe(true);
});

test('test update request location by id', async () => {
  let result = await EmergencyRecord.addHelpRequest('test', { lat: 1, lng: 1 }, 'form');
  expect(result.location.lat).toBe(1);
  expect(result.location.lng).toBe(1);
  await EmergencyRecord.updateRequestLocationById(result._id, { lat: 2, lng: 2 });
  result = await EmergencyRecord.getEmergencyRecordById(result._id);
  expect(result.location.lat).toBe(2);
  expect(result.location.lng).toBe(2);
});

test('test get help response by target', async () => {
  let result = await EmergencyRecord.addHelpRequest('test', { lat: 1, lng: 1 }, 'form');
  const response = await EmergencyRecord.addHelpResponse('test', { lat: 1, lng: 1 }, result._id);

  await EmergencyRecord.deleteEmergencyRecordById(result._id);
  result = await EmergencyRecord.getEmergencyRecordById(result._id);
  expect(result).toBe(null);
  result = await EmergencyRecord.getEmergencyRecordById(response._id);
  expect(result).toBe(null);
});
