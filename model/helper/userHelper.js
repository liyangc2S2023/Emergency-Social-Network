const cryptoJS = require('crypto-js');
const bannedName = require('../../public/username_exclude.json').name;

class UserHelper {
  static validatePassword(password, joinErr) {
    if (!password || password.length < 4) {
      joinErr.push('Password must be at least 4 characters long.');
      return false;
    }
    return true;
  }

  static validateUsername(name, joinErr) {
    if (!name || name.length < 3) {
      joinErr.push('Username must be at least 3 characters long.');
      return false;
    }
    // banned name
    if (bannedName.indexOf(name.toLowerCase()) !== -1) {
      joinErr.push('Current username is banned.');
      return false;
    }
    return true;
  }

  static encrypt(password, crypto = 'SHA256') {
    return cryptoJS[crypto](password).toString();
  }
}

module.exports = UserHelper;
