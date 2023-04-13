const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const EmergencyContact = require('../model/emergencyContact');
const EmergencyGroup = require('../model/emergencyGroup');

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

  // add some emergencyGroups to the database
  await EmergencyGroup.createEmergencyGroup('group1', 'user1', ['user2', 'user3', 'user4']);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test('test getEmergencyGroup by group name', async () => {
  const emergencyGroup = await EmergencyGroup.getEmergencyGroup('group1');
  expect(emergencyGroup.groupName).toBe('group1');
  expect(emergencyGroup.initiator).toBe('user1');
  expect(emergencyGroup.isClosed).toBe(false);
});

test('test getEmergencyGroup by member', async () => {
  const emergencyGroups = await EmergencyGroup.getEmergencyGroupByUser('user2');
  expect(emergencyGroups.length).toBe(1);
  expect(emergencyGroups[0].groupName).toBe('group1');

  // add one more emergencyGroup for this user
  await EmergencyGroup.createEmergencyGroup('group2', 'user2', ['user1', 'user3', 'user4']);
  const emergencyGroups2 = await EmergencyGroup.getEmergencyGroupByUser('user2');
  expect(emergencyGroups2.length).toBe(2);
});

test('test addMember', async () => {
  let emergencyGroup = await EmergencyGroup.getMembers('group1');
  expect(emergencyGroup.length).toBe(4);

  await EmergencyGroup.addMember('group1', 'user5');
  emergencyGroup = await EmergencyGroup.getMembers('group1');
  expect(emergencyGroup.length).toBe(5);

  // add a member that already exists
  await EmergencyGroup.addMember('group1', 'user5');
  emergencyGroup = await EmergencyGroup.getMembers('group1');
  expect(emergencyGroup.length).toBe(5);
});

test('test isInitiator', async () => {
  let emergencyGroup = await EmergencyGroup.isInitiator('group1', 'user1');
  expect(emergencyGroup).toBe(true);

  emergencyGroup = await EmergencyGroup.isInitiator('group1', 'user2');
  expect(emergencyGroup).toBe(false);
});

test('test close group', async () => {
  let emergencyGroup = await EmergencyGroup.isClosed('group1');
  expect(emergencyGroup).toBe(false);

  await EmergencyGroup.closeEmergencyGroup('group1', 'user1');
  emergencyGroup = await EmergencyGroup.isClosed('group1');
  expect(emergencyGroup).toBe(true);
});
