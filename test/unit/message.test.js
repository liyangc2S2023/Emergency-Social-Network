const Message = require('../../model/message');
const DB = require('../../database');

// let mongoServer;
// let dbConnection;

// beforeAll(async () => {
//   mongoServer = await MongoMemoryServer.create();
//   const mongoUri = mongoServer.getUri();
//   await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
//   const { connection } = mongoose;
//   dbConnection = connection;
// });

// beforeEach(async () => {
//   await dbConnection.db.dropDatabase();

//   // add some private messages
//   await Message.addMessage('t1', 't2', 'status', 'content');
//   await Message.addMessage('t1', 't2', 'status', 'content');
//   // add a public message
//   await Message.addMessage('t1', 'all', 'status', 'content');
// });

// afterAll(async () => {
//   await mongoose.disconnect();
//   await mongoServer.stop();
// });

// let mongoServer;
// let dbConnection;
let db;

beforeAll(async () => {
  // mongoServer = await MongoMemoryServer.create();
  // const mongoUri = mongoServer.getUri();
  // await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  // const { connection } = mongoose;
  // dbConnection = connection;
  db = new DB('test');
  await db.connect();
});

beforeEach(async () => {
  // await dbConnection.db.dropDatabase();
  await db.freshTables();
  const time = Date.now();
  // add some private messages
  await Message.addMessage('t1', 't2', 'status', 'content', time);
  await Message.addMessage('t1', 't2', 'status', 'content', time + 1000);
  // add a public message
  await Message.addMessage('t1', 'all', 'status', 'content', time + 2000);
});

afterAll(async () => {
  await db.disconnect();
});

test('test add messages', async () => {
  let result = await Message.getAll();
  expect(result.length).toBe(3);
  await Message.addMessage('t1', 't2', 'status', 'content', Date.now());
  result = await Message.getAll();
  expect(result.length).toBe(4);
});

test('test get by sender', async () => {
  expect((await Message.getBySender('t1')).length).toBe(3);
  expect((await Message.getBySender('t2')).length).toBe(0);

  await Message.addMessage('t2', 't1', 'status', 'change', Date.now());
  expect((await Message.getBySender('t1')).length).toBe(3);
  expect((await Message.getBySender('t2')).length).toBe(1);

  await Message.addMessage('t2', 'all', 'status', 'change', Date.now());
  expect((await Message.getBySender('t1')).length).toBe(3);
  expect((await Message.getBySender('t2')).length).toBe(2);
});

test('test get by receiver', async () => {
  expect((await Message.getMessageByReceiverOrRoom('t1')).length).toBe(0);
  expect((await Message.getMessageByReceiverOrRoom('t2')).length).toBe(2);
  expect((await Message.getMessageByReceiverOrRoom('all')).length).toBe(1);

  await Message.addMessage('t2', 't1', 'status', 'change', Date.now());
  expect((await Message.getMessageByReceiverOrRoom('t1')).length).toBe(1);
  expect((await Message.getMessageByReceiverOrRoom('t2')).length).toBe(2);
  expect((await Message.getMessageByReceiverOrRoom('all')).length).toBe(1);

  await Message.addMessage('t2', 'all', 'status', 'toAll', Date.now());
  expect((await Message.getMessageByReceiverOrRoom('t1')).length).toBe(1);
  expect((await Message.getMessageByReceiverOrRoom('t2')).length).toBe(2);
  expect((await Message.getMessageByReceiverOrRoom('all')).length).toBe(2);
});

test('test get by private', async () => {
  expect((await Message.getPrivateMessagesBetween('t1', 't2')).length).toBe(2);

  await Message.addMessage('t2', 't1', 'status', 'change', Date.now());
  expect((await Message.getPrivateMessagesBetween('t1', 't2')).length).toBe(3);
  expect((await Message.getPrivateMessagesBetween('t1', 't3')).length).toBe(0);

  await Message.addMessage('t1', 't3', 'status', 'change', Date.now());
  expect((await Message.getPrivateMessagesBetween('t1', 't2')).length).toBe(3);
  expect((await Message.getPrivateMessagesBetween('t1', 't3')).length).toBe(1);
});

test('test get latest message between two users', async () => {
  let result = (await Message.getLatestMessageBetween('t1', 't2')).content;
  expect(result).toBe('content');

  await Message.addMessage('t2', 't1', 'status', 'change', Date.now() + 1000);
  result = (await Message.getLatestMessageBetween('t1', 't2')).content;
  expect(result).toBe('change');

  result = (await Message.getLatestMessageBetween('t1', 't3'));
  expect(result).toBe(undefined);

  await Message.addMessage('t1', 't3', 'status', 'hello', Date.now() + 2000);
  result = (await Message.getLatestMessageBetween('t1', 't2')).content;
  expect(result).toBe('change');

  result = (await Message.getLatestMessageBetween('t1', 't3')).content;
  expect(result).toBe('hello');
});

test('test user read message', async () => {
  await Message.addMessage('t2', 't1', 'status', 'content', Date.now() + 1000);
  const updateResult = await Message.userReadMessage('t1', 't2');
  expect(updateResult.modifiedCount).toBe(2);
  const result = (await Message.getPrivateMessagesBetween('t1', 't2'));
  // should read receiver message, not read sender message
  expect(result[1].isRead).toBe(true);
  expect(result[2].isRead).toBe(false);
  expect(result[0].isRead).toBe(true);
});

test('test get all unread messages', async () => {
  await Message.addMessage('t3', 't2', 'status', 'content', Date.now());
  await Message.addMessage('t4', 't2', 'status', 'content', Date.now());
  await Message.addMessage('t5', 't2', 'status', 'content', Date.now());

  const result = await Message.getUserUnreadMessage('t2');
  expect(result.length).toBe(5);

  const updateResult = await Message.userReadMessage('t3', 't2');
  expect(updateResult.modifiedCount).toBe(1);

  const result2 = await Message.getUserUnreadMessage('t2');
  expect(result2.length).toBe(4);
});

test('test get all usernames with unread message', async () => {
  await Message.addMessage('t3', 't2', 'status', 'content', Date.now());
  await Message.addMessage('t4', 't2', 'status', 'content', Date.now());
  await Message.addMessage('t5', 't2', 'status', 'content', Date.now());

  const result = await Message.getAllUsernamesWithUnreadMessage('t2');
  expect(result.size).toBe(4);

  const requiredElements = ['t1', 't3', 't4', 't5'];
  requiredElements.forEach((element) => {
    expect(result.has(element)).toBeTruthy();
  });

  const updateResult = await Message.userReadMessage('t3', 't2');
  expect(updateResult.modifiedCount).toBe(1);

  const result2 = await Message.getAllUsernamesWithUnreadMessage('t2');
  expect(result2.size).toBe(3);
});

test('test search information by public message and get no result', async () => {
  // if keywords are empty, it will return all public messages
  const keywords = [];
  // there should be 1 public message
  expect((await Message.searchByPublicMessage(keywords)).length).toBe(1);
  // if no existing public messages matches one of the keywords, it should return empty result.
  keywords[0] = 'hello';
  keywords[1] = 'bye';
  expect(await Message.searchByPublicMessage(keywords)).toEqual([]);
});

test('test search information by public message and get matching messages', async () => {
  // add two private messages
  const time = Date.now();
  await Message.addMessage('lisa', 'noreen', 'ok', 'hi', time + 100);
  await Message.addMessage('noreen', 'lisa', 'ok', 'hello', time + 2000);
  // add two public messages
  await Message.addMessage('lisa', 'all', 'help', 'hi all', time + 3000);
  await Message.addMessage('noreen', 'all', 'emergency', 'hello all', time + 4000);
  // search for keywords: hi
  const keywords = [];
  keywords[0] = 'hi';
  expect((await Message.searchByPublicMessage(keywords)).length).toBe(1);
  let res;
  res = await Message.searchByPublicMessage(keywords);
  expect(res[0].content).toBe('hi all');
  expect(res[0].sender).toBe('lisa');
  // search for keywords: hello and hi
  keywords[1] = 'hello';
  expect((await Message.searchByPublicMessage(keywords)).length).toBe(2);
  res = await Message.searchByPublicMessage(keywords);
  console.log(res);
  // result should be ordered by timestamp
  expect(res[0].content).toBe('hello all');
  expect(res[0].sender).toBe('noreen');
  expect(res[1].content).toBe('hi all');
  expect(res[1].sender).toBe('lisa');
});

test('test search information by public message and get more than 10 matching results', async () => {
  // add ten more public messages
  const t = Date.now();
  for (let i = 1; i < 12; i += 1) {
    // eslint-disable-next-line
    await Message.addMessage("t" + i, 'all', 'ok', 'content', t + i * 1000);
  }
  // search for keywords: content
  const keywords = [];
  keywords[0] = 'content';
  // there are 11 matching public messages, but the result should only return 10 latest messages.
  const res = await Message.searchByPublicMessage(keywords);
  expect(res.length).toBe(10);
  // should be ordered by timestamp
  expect(res[0].sender).toBe('t11');
});

test('test search information by private message and get no result', async () => {
  // if keywords are empty, it will return all private messages
  const keywords = [];
  // there should be 2 private messages sent by t1
  expect((await Message.searchByPrivateMessage(keywords, 't1', 't2')).length).toBe(2);
  // if no existing private messages matches one of the keywords, it should return empty result.
  keywords[0] = 'hello';
  keywords[1] = 'bye';
  expect(await Message.searchByPrivateMessage(keywords, 't1', 't2')).toEqual([]);
});

test('test search information by private message and get matching messages', async () => {
  // add some private messages
  await Message.addMessage('lisa', 'noreen', 'ok', 'hello', Date.now() + 1000);
  await Message.addMessage('lisa', 'noreen', 'ok', 'hello', Date.now() + 2000);
  await Message.addMessage('noreen', 'lisa', 'ok', 'hello', Date.now() + 3000);
  await Message.addMessage('noreen', 'joseph', 'ok', 'hello', Date.now() + 4000);
  // add two public messages
  await Message.addMessage('lisa', 'all', 'help', 'hi all', Date.now() + 5000);
  await Message.addMessage('noreen', 'all', 'emergency', 'hello all', Date.now() + 6000);
  // search for keywords: hi
  const keywords = [];
  keywords[0] = 'hello';
  expect((await Message.searchByPrivateMessage(keywords, 'lisa', 'noreen')).length).toBe(3);
  let res;
  res = await Message.searchByPrivateMessage(keywords, 'lisa', 'noreen');
  // result should be ordered by timestamp
  expect(res[0].content).toBe('hello');
  expect(res[0].sender).toBe('noreen');
  expect(res[1].content).toBe('hello');
  expect(res[1].sender).toBe('lisa');
  // search for keywords: he and hi
  keywords[1] = 'he';
  expect((await Message.searchByPrivateMessage(keywords, 'lisa', 'noreen')).length).toBe(3);
  res = await Message.searchByPrivateMessage(keywords, 'lisa', 'noreen');
  // result should include both keyword 'hi' and 'he'
  expect(res[0].content).toBe('hello');
  expect(res[1].content).toBe('hello');
});

test('test search information by private message and get more than 10 matching results', async () => {
  // add ten more private messages
  await Message.addMessage('t1', 't2', 'ok', 'content1', Date.now() + 1000);
  await Message.addMessage('t1', 't2', 'ok', 'content2', Date.now() + 2000);
  await Message.addMessage('t1', 't2', 'ok', 'content3', Date.now() + 3000);
  await Message.addMessage('t1', 't2', 'ok', 'content4', Date.now() + 4000);
  await Message.addMessage('t1', 't2', 'ok', 'content5', Date.now() + 5000);
  await Message.addMessage('t1', 't2', 'ok', 'content6', Date.now() + 6000);
  await Message.addMessage('t1', 't2', 'ok', 'content7', Date.now() + 7000);
  await Message.addMessage('t1', 't2', 'ok', 'content8', Date.now() + 8000);
  await Message.addMessage('t1', 't2', 'ok', 'content9', Date.now() + 9000);
  await Message.addMessage('t1', 't2', 'ok', 'content10', Date.now() + 10000);
  // add a private messages not between t1 and t2
  await Message.addMessage('t1', 't3', 'ok', 'content', Date.now() + 11000);
  await Message.addMessage('t2', 't3', 'ok', 'content', Date.now() + 12000);
  // search for keywords: content
  const keywords = [];
  keywords[0] = 'content';
  // there are 12 matching public messages, but the result should only return 10 latest messages.
  const res = await Message.searchByPrivateMessage(keywords, 't1', 't2');
  expect(res.length).toBe(10);
  // should be ordered by timestamp
  expect(res[0].content).toBe('content10');
});
