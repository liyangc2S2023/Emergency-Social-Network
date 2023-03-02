const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose")
const Message = require("../model/message")
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

test('test add message', async () => {
    await Message.addMessage("t1","t2","s","content")
    var result = await Message.getAll()
    // expect(result.);
});
