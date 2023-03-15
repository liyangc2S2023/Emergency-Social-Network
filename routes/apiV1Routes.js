const express = require('express');
const pug = require('pug');
const Result = require('./common/result');
const messageController = require('../controller/messageController');
const userController = require('../controller/userController');
const statusController = require('../controller/statusController');
const config = require('../config');

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

router.post('/messages', async (req, res) => {
  const msg = {
    sender: req.body.sender,
    statusStyle: config.statusMap[req.body.status],
    content: req.body.content,
    receiver: req.body.receiver,
  };
  const messageListHTML = pug.renderFile('./views/message.pug', { msg });
  const result = await messageController.addMessage(
    req.body.sender,
    req.body.receiver,
    req.body.status,
    req.body.content,
  );
  req.io.emit('newMessage', messageListHTML, req.body.sender);
  res.send(Result.success(result));
});

router.get('/messages/:senderId', async (req, res) => res.send(Result.success(await messageController.getBySender(req.params.senderId))));

router.get('/messages/private/:senderId/:receiverId', async (req, res) => res.send(Result.success(await messageController.getPrivateMessagesBetween(req.params.senderId, req.params.receiverId))));

router.post('/status', async (req, res) => {
  const status = await statusController.updateUserStatus(req.body.username, req.body.status);
  req.io.emit('statusChange', { username: req.body.username, status });
  return res.send(Result.success({ status }));
});

module.exports = router;
