const express = require('express');
const pug = require('pug');
const Result = require('./common/result');

const router = express.Router();

const emergencyGroupController = require('../controller/emergencyGroupController');

router.get('/', async (req, res) => {
  const { username } = req.body;
  const emergencyGroups = await emergencyGroupController.getOpenEmergencyGroupByUsername(username);
  const groupsHTML = pug.renderFile('./views/emergencyGroups.pug', { emergencyGroups });
  res.send(Result.success({ groupsHTML }));
});
