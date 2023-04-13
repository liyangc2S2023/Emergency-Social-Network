const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const EmergencyContact = require('../model/emergencyContact');

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

  // add some emergencyContacts to the database
  await EmergencyContact.addEmergencyContact('user1', 'user2', Date.now() + 1000);
  await EmergencyContact.addEmergencyContact('user1', 'user3', Date.now() + 2000);
  await EmergencyContact.addEmergencyContact('user2', 'user4', Date.now() + 3000);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test('getEmergencyContact', async () => {
  const emergencyContacts = await EmergencyContact.getEmergencyContact('user1');
  expect(emergencyContacts.length).toBe(2);
  expect(emergencyContacts[0].username).toBe('user1');
  expect(emergencyContacts[0].contact).toBe('user3');
  expect(emergencyContacts[1].username).toBe('user1');
  expect(emergencyContacts[1].contact).toBe('user2');
});

test('addEmergencyContacts', async () => {
  await EmergencyContact.addEmergencyContact('user1', 'user4', Date.now() + 4000);
  const emergencyContacts = await EmergencyContact.getEmergencyContact('user1');
  expect(emergencyContacts.length).toBe(3);
  expect(emergencyContacts[0].username).toBe('user1');
  expect(emergencyContacts[0].contact).toBe('user4');
  expect(emergencyContacts[1].username).toBe('user1');
  expect(emergencyContacts[1].contact).toBe('user3');
  expect(emergencyContacts[2].username).toBe('user1');
  expect(emergencyContacts[2].contact).toBe('user2');
});

test('deleteEmergencyContact', async () => {
  await EmergencyContact.deleteEmergencyContact('user1', 'user2');
  const emergencyContacts = await EmergencyContact.getEmergencyContact('user1');
  expect(emergencyContacts.length).toBe(1);
  expect(emergencyContacts[0].username).toBe('user1');
  expect(emergencyContacts[0].contact).toBe('user3');
});
