const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

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
