const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Announcement = require('../../model/announcement');

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

test('test search announcement by public message and get no result', async () => {
  // if keywords are empty, it will return all announcements
  const keywords = [];
  // there should be 2 announcements
  expect((await Announcement.searchByAnnouncement(keywords)).length).toBe(2);
  // if no existing announcement matches one of the keywords, it should return empty result.
  keywords[0] = 'hello';
  keywords[1] = 'bye';
  expect(await Announcement.searchByAnnouncement(keywords)).toEqual([]);
});

test('test search information by announcement and get matching announcements', async () => {
  // search for keywords: content1
  const keywords = [];
  keywords[0] = 'content1';
  expect((await Announcement.searchByAnnouncement(keywords)).length).toBe(1);
  let res;
  res = await Announcement.searchByAnnouncement(keywords);
  expect(res[0].content).toBe('content1');
  // search for keywords: content1 and content2
  keywords[1] = 'content2';
  expect((await Announcement.searchByAnnouncement(keywords)).length).toBe(2);
  res = await Announcement.searchByAnnouncement(keywords);
  // result should be ordered by timestamp
  expect(res[0].content).toBe('content2');
  expect(res[1].content).toBe('content1');
});

test('test search information by announcement and get more than 10 matching results', async () => {
  // add eleven announcements
  await Announcement.addAnnouncement('admin3', 'content1', 'coordinator');
  await Announcement.addAnnouncement('admin3', 'content2', 'coordinator');
  await Announcement.addAnnouncement('admin3', 'content3', 'coordinator');
  await Announcement.addAnnouncement('admin3', 'content4', 'coordinator');
  await Announcement.addAnnouncement('admin3', 'content5', 'coordinator');
  await Announcement.addAnnouncement('admin3', 'content6', 'coordinator');
  await Announcement.addAnnouncement('admin3', 'content7', 'coordinator');
  await Announcement.addAnnouncement('admin3', 'content8', 'coordinator');
  await Announcement.addAnnouncement('admin3', 'content9', 'coordinator');
  await Announcement.addAnnouncement('admin3', 'content10', 'coordinator');
  await Announcement.addAnnouncement('admin3', 'content11', 'coordinator');
  // search for keywords: content
  const keywords = [];
  keywords[0] = 'content';
  // there are more than 10 matching announcements,
  // but the result should only return 10 latest announcements.
  const res = await Announcement.searchByAnnouncement(keywords);
  expect(res.length).toBe(10);
  // should be ordered by timestamp
  // expect(res[0].content).toBe('content11');
});
