const express = require('express');
const pug = require('pug');
const Result = require('./common/result');

const router = express.Router();

const emergencyContactController = require('../controller/emergencyContactController');

router.get('/', async (req, res) => {
  const username = req.body.username.toLowerCase();
  const contacts = await emergencyContactController.getEmergencyContact(username);
  let contactsHTML = '';
  contacts.forEach((contact) => {
    contactsHTML += pug.renderFile('./views/emergencyContactItem.pug', { contact });
  });
  res.send(Result.success({ contactsHTML }));
});

router.post('/', async (req, res) => {
  const username = req.body.username.toLowerCase();
  const usernameOther = req.body.contact.toLowerCase();
  await emergencyContactController.addEmergencyContact(username, usernameOther);
  const contacts = await emergencyContactController.getEmergencyContact(username);
  let contactsHTML = '';
  contacts.forEach((contact) => {
    contactsHTML += pug.renderFile('./views/emergencyContactItem.pug', { contact });
  });
  res.send(Result.success({ contactsHTML }));
});

module.exports = router;
