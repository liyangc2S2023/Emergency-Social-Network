const express = require('express');
const pug = require('pug');

const router = express.Router();
const userController = require('../controller/userController');

router.get('/', async (req, res) => {
  await userController.login(req.username);
  const userList = await userController.getAll();
  res.render('mainPage', { pageView: 'Directory', users: userList });

  const userListHTML = pug.renderFile('./views/directory.pug', { users: userList });
  req.io.emit('userlistChange', userListHTML);
});

module.exports = router;
