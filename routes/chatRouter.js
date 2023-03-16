const express = require('express');

const router = express.Router();
const pug = require('pug');
const renderOnePage = require('./common/renderOnePage');
const messageController = require('../controller/messageController');
const config = require('../config');
const date2Str = require('../utils/dateUtil');

router.get('/', async (req, res) => { renderOnePage(req, res, 'Public'); });

router.get('/messages/private/:senderId/:receiverId', async (req, res) => {
  const { senderId, receiverId } = req.params;
  const messageList = await messageController.getPrivateMessagesBetween(senderId, receiverId);
  // also mark the message as read
  await messageController.markAsRead(senderId, receiverId);
  let messageHTML = '';

  messageList.forEach((msg) => {
    msg.statusStyle = config.statusMap[msg.status];
    msg.time = date2Str(msg.timestamp);
    msg.isSender = msg.sender === senderId;
    messageHTML += pug.renderFile('./views/message.pug', { msg });
  });
  // render to HTML
  res.send(messageHTML);
});

module.exports = router;
