const UserHelper = require('../model/helper/userHelper')
const User = require('../model/user')
const cryptoJS = require('crypto-js');
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose")
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

test('test validate password', async () => {
    expect(UserHelper.validatePassword("",[])).toBe(false)
    expect(UserHelper.validatePassword("1",[])).toBe(false)
    expect(UserHelper.validatePassword("23",[])).toBe(false)
    expect(UserHelper.validatePassword(null,[])).toBe(false)
    expect(UserHelper.validatePassword("None",[])).toBe(true)
    expect(UserHelper.validatePassword("1234",[])).toBe(true)
});

test('test validate username', async()=>{
    expect(UserHelper.validateUsername(null,[])).toBe(false)
    expect(UserHelper.validateUsername("",[])).toBe(false)
    expect(UserHelper.validateUsername("1",[])).toBe(false)
    expect(UserHelper.validateUsername("12",[])).toBe(false)
    expect(UserHelper.validateUsername("about",[])).toBe(false)
    expect(UserHelper.validateUsername("1234",[])).toBe(true)
})

test('test encrypt function', async()=>{
    expect(UserHelper.encrypt("123")).toBe(cryptoJS['SHA256']("123").toString())
})

test('test name rule check', async()=>{
    expect(User.nameRuleCheck("test123","1234").successflag).toBe(true)
    expect(User.nameRuleCheck("about","123").successflag).toBe(false)
    expect(User.nameRuleCheck("1","123").successflag).toBe(false)
    expect(User.nameRuleCheck("test","1").successflag).toBe(false)
    expect(User.nameRuleCheck(null,"123").successflag).toBe(false)
    expect(User.nameRuleCheck("test",null).successflag).toBe(false)
})

test('test getAll', async()=>{
    await User.addUser("test1","tttt")
    expect((await User.getAll()).length).toBe(1)
    await User.addUser("test2","tttt")
    expect((await User.getAll()).length).toBe(2)
    await User.addUser("test3","tttt")
    expect((await User.getAll()).length).toBe(3)
    await User.addUser("test4","tttt")
    expect((await User.getAll()).length).toBe(4)
})

test('test addUser', async()=>{
    await User.addUser("test111","1234")
    expect((await User.getOne("test111")).username).toBe("test111")
})

test('test usernameExists', async()=>{
    expect((await User.usernameExists("tttt")).successFlag).toBe(true)
    await User.addUser("tttt","1234")
    expect((await User.usernameExists("tttt")).successFlag).toBe(false)
})

test('test confirmJoin', async()=>{
    await User.confirmJoin("test123","1234")
    expect((await User.getOne("test123")).username).toBe("test123")
})

test('test checkPassword', async()=>{
    await User.addUser("testPassword","123456")
    expect(await User.checkPassword("testPassword","123456")).toBe(true)
    expect(await User.checkPassword("testPassword","12345")).toBe(false)
})

test('test user login logout', async()=>{
    await User.addUser("testLogin","123456")
    expect((await User.getOne("testLogin")).online).toBe(false)
    await User.login("testLogin")
    expect((await User.getOne("testLogin")).online).toBe(true)
    await User.logout("testLogin")
    expect((await User.getOne("testLogin")).online).toBe(false)
})

test('test getOne', async()=>{
    await User.addUser("testGetOne","123456")
    expect((await User.getOne("testGetOne")).username).toBe("testGetOne")
})
