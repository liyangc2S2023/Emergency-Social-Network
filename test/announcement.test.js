const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Announcement = require('../model/announcement');

let mongoServer;

beforeEach(async () => {
  // assuming mongoose@6.x
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  await Announcement.addAnnouncement('admin1', 'content1', 'coordinator');
  await Announcement.addAnnouncement('admin2', 'content2', 'coordinator');
});

afterEach(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test('test get all announcement', async () => {
  expect((await Announcement.getAll()).length).toBe(2);
});

test('test add Announcement', async () => {
  let result = await Announcement.getAll();
  expect(result.length).toBe(2);
  await Announcement.addAnnouncement('admin1', 'content3', 'coordinator');
  result = await Announcement.getAll();
  expect(result.length).toBe(3);

  await Announcement.addAnnouncement('admin1', 'content4', 'user');
  result = await Announcement.getAll();
  expect(result.length).toBe(3);
});

test('test get by sender', async () => {
  expect((await Announcement.getBySender('admin1')).length).toBe(1);
  expect((await Announcement.getBySender('admin2')).length).toBe(1);
  expect((await Announcement.getBySender('admin3')).length).toBe(0);

  await Announcement.addAnnouncement('admin1', 'change1', 'coordinator');
  expect((await Announcement.getBySender('admin1')).length).toBe(2);
  expect((await Announcement.getBySender('admin2')).length).toBe(1);
  expect((await Announcement.getBySender('admin3')).length).toBe(0);

  await Announcement.addAnnouncement('admin3', 'change2', 'coordinator');
  expect((await Announcement.getBySender('admin1')).length).toBe(2);
  expect((await Announcement.getBySender('admin2')).length).toBe(1);
  expect((await Announcement.getBySender('admin3')).length).toBe(1);
});

test('test get latest announcement', async () => {
  let result = (await Announcement.getLatestAnnouncement()).content;
  expect(result).toBe('content2');

  await Announcement.addAnnouncement('admin3', 'change', 'coordinator');
  result = (await Announcement.getLatestAnnouncement()).content;
  expect(result).toBe('change');
});
