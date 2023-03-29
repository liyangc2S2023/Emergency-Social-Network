const express = require('express');
const userController = require('../controller/userController');
const Result = require('./common/result')

const router = express.Router();

router.put('/login', async (req, res) => {
    const username = req.body.username.toLowerCase();
    const password = req.body.password.toLowerCase();
    const loginFlag = await userController.verifyUser(username, password);
    if (loginFlag) {
      const token = await userController.login(username);
      res.status(200);
      res.send({ token });
    } else {
      res.status(400);
      res.send(Result.fail());
    }
});

router.post('/users', async (req, res) => res.send(Result.success(await userController.addUser(req.body.username, req.body.password, req.body.role))));

module.exports = router;
