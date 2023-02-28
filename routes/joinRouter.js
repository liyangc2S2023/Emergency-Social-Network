const express = require('express');
const joinController = require('../controller/joinController');
const userController = require('../controller/userController');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('join');
});

router.post('/', async (req, res) => {
  const username = req.body.username.toLowerCase();
  const password = req.body.password.toLowerCase();
  // scene 1: username exists and user password verified
  // return 200 and render directory
  const loginFlag = await userController.verifyUser(username, password);
  if (loginFlag) {
    const token = await userController.login(username);
    res.cookie('user_token', token, { maxAge: 24 * 60 * 60 * 1000 });
    res.status(200);
    res.redirect('/directory');
    return;
  }

  // if not login, then join community
  // scene 2: username and user password are valid to register
  // scene 3: username and user password are not valid to register
  const { successflag, joinErr } = await joinController.join(username, password);
  if (successflag) {
    res.status(200);
    res.render('join', { joinComfirm: true, username, password });
  } else {
    res.status(400);
    res.render('join', { joinErr });
  }
});

router.post('/confirm', async (req, res, next) => {
  const username = req.body.username.toLowerCase();
  const password = req.body.password.toLowerCase();
  const loginFlag = await userController.verifyUser(username, password);
  let token;
  if (loginFlag) {
    token = await userController.login(username);
    res.cookie('user_token', token, { maxAge: 24 * 60 * 60 * 1000 });
    res.status(200);
    res.redirect('/directory');
    return;
  }
  const confirmResult = await joinController.confirmJoin(username, password, next);
  if (confirmResult.successflag) {
    token = await userController.login(username);
    res.status(200);
    res.cookie('user_token', token, { maxAge: 24 * 60 * 60 * 1000 });
    res.render('welcomeRules');
  } else {
    res.status(400);
    res.render('join', { joinErr: confirmResult.err, username, password });
  }
});

module.exports = router;
