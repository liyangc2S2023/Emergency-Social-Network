const express = require('express');
const Result = require('./common/result');
const messageController = require('../controller/messageController');
const userController = require('../controller/userController');

const router = express.Router();

router.get('/users', async (req, res) => res.send(Result.success(await userController.getAll())));

router.get('/users/current', async (req, res) => {
  const { username } = req;
  const user = await userController.getOne(username);
  if (user) {
    return res.send(Result.success({ username, status: user.status }));
  }

  return res.status(400).send(Result.fail(username, ''));
});

router.get('/users/:userId', async (req, res) => res.send(Result.success(await userController.getOne(req.params.userId))));

router.post('/users', async (req, res) => res.send(Result.success(await userController.addUser(req.body.username, req.body.password, req.body.role))));

router.get('/messages', async (req, res) => res.send(Result.success(await messageController.getAll())));

router.post('/messages', async (req, res) => res.send(Result.success(await messageController.addMessage(req.body.sender, req.body.receiver, req.body.status, req.body.content))));

router.get('/messages/:senderId', async (req, res) => res.send(Result.success(await messageController.getBySender(req.params.senderId))));

router.get('/messages/private/:senderId/:receiverId', async (req, res) => res.send(Result.success(await messageController.getByPrivate(req.params.senderId, req.params.receiverId))));

module.exports = router;
