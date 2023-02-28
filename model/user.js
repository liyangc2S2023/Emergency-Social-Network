const cryptoJS = require('crypto-js');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../config');

const bannedName = require('../public/username_exclude.json').name;

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  online: { type: Boolean, default: false },
  status: { type: String, default: 'undefined' },
});

const UserTable = mongoose.model('User', userSchema);

function validatePassword(password, joinErr) {
  if (!password || password.length < 4) {
    joinErr.push('Password must be at least 4 characters long.');
    return false;
  }
  return true;
}

function validateUsername(name, joinErr) {
  const username = name.toLowerCase();

  if (!username || username.length < 3) {
    joinErr.push('Username must be at least 3 characters long.');
    return false;
  }
  // banned name
  if (bannedName.indexOf(username) !== -1) {
    joinErr.push('Current username is banned.');
    return false;
  }
  return true;
}

function encrypt(password, crypto = 'SHA256') {
  return cryptoJS[crypto](password).toString();
}

class User {
  static nameRuleCheck(username, password) {
    const joinErr = [];
    let successflag = true;
    successflag = validatePassword(password, joinErr) && successflag;
    successflag = validateUsername(username, joinErr) && successflag;

    return { successflag, joinErr };
  }

  static async usernameExists(username) {
    // check duplicate username
    // todo: learn more about promise
    const user = await UserTable.findOne({ username }).exec();
    if (user) {
      return { successFlag: false, err: 'Username Already Exists.' };
    }

    return { successFlag: true, err: undefined };
  }

  static async confirmJoin(username, password) {
    // apply full (with DB check) checks when people comfirm join
    const token = jwt.sign({
      time: Date(),
      username,
    }, config.JWT_KEY, { expiresIn: '1d' });
    // todo: learn more about promise
    await UserTable.create({ username, password: encrypt(password) });
    return token;
  }

  static async checkPassword(username, password) {
    const user = await UserTable.findOne({ username }).exec();
    if (user) {
      if (encrypt(password) === user.password) return true;
    }
    return false;
  }

  static async createUser(username, password) {
    return UserTable.create({ username, password: encrypt(password) });
  }

  static async login(username) {
    // return a token after login
    const token = jwt.sign({
      time: Date(),
      username,
    }, config.JWT_KEY, { expiresIn: '1d' });
    // update user status to online
    await UserTable.updateOne({ username }, { $set: { online: true } });
    return token;
  }

  static async logout(username) {
    // update user status to offline
    return UserTable.updateOne({ username }, { $set: { online: false } });
  }

  static async getAll() {
    // return all users sorted by online status and username in alphabetical order
    return UserTable.find({}).sort({ online: 'desc', username: 'asc' });
  }

  static async getOne(username) {
    // return await UserTable.findOne({ "username": username }, { "online": true })
    return UserTable.findOne({ username });
  }

  static async addUser(username, password) {
    return UserTable.create({ username, password: encrypt(password) });
  }
}

module.exports = User;

/**
 * How to use CRUD operations:
 *
 * User.create(data)
 * to create a new document and save it to the users collection.
 *
 * user.save()
 * to save changes made to an existing document to the users collection.
 *
 * User.find()
 * to retrieve all documents from the users collection.
 *
 * User.findById(id)
 * to retrieve a document from the users collection by its _id field.
 *
 * User.findOne({})
 * to retrieve the first document that matches the given query from the users collection.
 *
 * user.remove()
 * to remove an existing document from the users collection.
 */
