const cryptoJS = require('crypto-js')
const mongoose = require('mongoose');
const config = require('../config')
const jwt = require('jsonwebtoken')

const bannedName=require('../public/username_exclude.json').name

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const UserTable = mongoose.model('User', userSchema);


function validatePassword(password, joinErr){
  if(!password || password.length<4) {
      joinErr.push("Password must be at least 4 characters long.")
      return false
  }
  return true
}

function validateUsername(username, joinErr){
    if(!username || username.length<3) { 
        joinErr.push("Username must be at least 3 characters long.")
        return false
    }
    username=username.toLowerCase()
    // banned name
    if(bannedName.indexOf(username)!=-1) {
        joinErr.push("Current username is banned.")
        return false
    }
    return true
}

function encrypt(password,crypto='SHA256'){
  return cryptoJS[crypto](password)
}


async function usernameExists(username) {
  // check duplicate username
  // todo: learn more about promise
  var user = await UserTable.findOne({username:username}).exec()
  if(user){
      return false
  }
  else {
      return true
  }
}

class User{

  static nameRuleCheck(username, password) {
      var joinErr = []
      var successflag = true
      successflag = validatePassword(password, joinErr) && successflag 
      successflag = validateUsername(username, joinErr) && successflag 

      return {successflag, joinErr}
  }

  static async confirmJoin(username,password){
    // apply full (with DB check) checks when people comfirm join
    var {successflag, joinErr} = User.nameRuleCheck(username, password)
    var token = ""
    if (successflag) {
        // will try to store/read in DB if basic check passed.
        successflag = successflag && await usernameExists(username)

        if (!successflag) {
            joinErr.push("Username Already Exists.")
        } else {
            token=jwt.sign({
                time:Date(),
                username:username
            },config.JWT_KEY, {expiresIn:'1d'})
            // todo: learn more about promise
            await UserTable.create({"username":username,"password":encrypt(password)})
        }
    }
    return {successflag,token,joinErr}  
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
