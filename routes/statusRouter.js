const express = require('express');
const statusController = require('../controller/statusController');

const router = express.Router();

router.get('/', async (req, res) => {
  const userStatus = await statusController.getStatus(req.username);
  res.status(200);
  res.render('mainPage', { pageView: 'Status', userStatus });
});

router.post('/', async (req, res) => {
  const { status } = req.body;
  await statusController.updateUserStatus(status.username, status.status);
  res.status(200);
  res.render('mainPage', { pageView: 'Status', status });
});

module.exports = router;
