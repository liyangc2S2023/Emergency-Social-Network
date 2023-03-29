const express = require('express');
const pug = require('pug');
const Result = require('./common/result');
const messageController = require('../controller/messageController');
const userController = require('../controller/userController');
const statusController = require('../controller/statusController');
const searchController = require('../controller/searchController');
const announcementController = require('../controller/announcementController');
const socketMap = require('../utils/socketMap');
const config = require('../config');
const date2Str = require('../utils/dateUtil');

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

router.get('/messages', async (req, res) => res.send(Result.success(await messageController.getAll())));

router.post('/messages', async (req, res) => {
  const msg = {
    sender: req.body.sender,
    statusStyle: config.statusMap[req.body.status],
    content: req.body.content,
    receiver: req.body.receiver,
  };
  const result = await messageController.addMessage(
    req.body.sender,
    req.body.receiver,
    req.body.status,
    req.body.content,
  );
  msg.time = date2Str(new Date(result.timestamp));
  const messageListHTML = pug.renderFile('./views/message.pug', { msg });
  req.io.emit('newMessage', messageListHTML, req.body.sender);
  res.send(Result.success(result));
});

router.get('/messages/:senderId', async (req, res) => res.send(Result.success(await messageController.getBySender(req.params.senderId))));

router.get('/messages/private/:senderId/:receiverId', async (req, res) => {
  const { senderId, receiverId } = req.params;
  const result = await messageController.getPrivateMessagesBetween(senderId, receiverId);
  res.send(Result.success(result));
});

const renderMessageHTML = (msg) => {
  const {
    sender, receiver, status, content, timestamp,
  } = msg;
  const messageHTML = pug.renderFile('./views/message.pug', {
    msg: {
      sender,
      receiver,
      statusStyle: config.statusMap[status],
      content,
      time: date2Str(timestamp),
    },
  });
  return messageHTML;
};

router.post('/messages/private/:senderId/:receiverId', async (req, res) => {
  const {
    sender, receiver, status, content,
  } = req.body;
  // save to database
  const result = await messageController.addMessage(sender, receiver, status, content);
  // render html
  const messageHTML = renderMessageHTML(result);

  // send back to sender over socket. when send to self, prevent render
  if (receiver !== sender) {
    const senderSocket = socketMap.getInstance().getSocket(sender);
    if (senderSocket) senderSocket.emit('newPrivateMessage', messageHTML, sender);
  }
  // send to receiver
  const receiverSocket = socketMap.getInstance().getSocket(receiver);
  if (receiverSocket) {
    receiverSocket.emit('newPrivateMessage', messageHTML, sender);
  }
  res.send(Result.success());
});

router.post('/status', async (req, res) => {
  const status = await statusController.updateUserStatus(req.body.username, req.body.status);
  req.io.emit('statusChange', { username: req.body.username, status });
  return res.send(Result.success({ status }));
});

router.post('/announcements', async (req, res) => {
  const ancm = {
    sender: req.body.sender,
    content: req.body.content,
    time: req.body.timestamp,
  };
  const result = await announcementController.addAnnouncement(
    req.body.sender,
    req.body.content,
    config.USER_ROLE.COORDINATOR,
  );
  ancm.time = date2Str(new Date(req.body.timestamp));
  const announcementHTML = pug.renderFile('./views/announcement.pug', { ancm });
  req.io.emit('newAnnouncement', announcementHTML);
  return res.send(Result.success(result));
});

router.get('/search', async (req, res) => {
  const {
    context, criteria, sender, receiver, page,
  } = req.query;
  const searchResult = await searchController.searchContent(context, criteria.split(','), sender, receiver, page);
  res.send(Result.success(searchResult));
});

module.exports = router;
