const express = require('express');
const pug = require('pug');

const router = express.Router();
const userController = require('../controller/userController');

router.get('/', async (req, res) => {
  const { username } = req;
  // clear user states
  await userController.logout(username);
  // clear cookie
  res.clearCookie('user_token');
  res.status(200);
  // render welcome
  res.redirect('/welcome');
});

module.exports = router;
