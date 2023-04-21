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
const EmergencyContactController = require('../controller/emergencyContactController');
const EmergencyGroupController = require('../controller/emergencyGroupController');

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

router.get('/messages/group/:groupId', async (req, res) => {
  const { groupId } = req.params;
  const result = await messageController.getMessageByReceiverOrRoom(groupId);
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
  console.log(sender, receiver, status, content);
  const result = await messageController.addMessage(sender, receiver, status, content);
  // render html
  const messageHTML = renderMessageHTML(result);

  // check if it is a group message
  // parse receiver to get groupId
  const isGroupMessage = receiver.split('-')[0] === 'group';
  if (isGroupMessage) {
    // send to all members
    const groupName = receiver.split('-').slice(1).join('-');
    const members = await EmergencyGroupController.getMembers(groupName);
    console.log('memerber', members);
    members.forEach((member) => {
      const memberSocket = socketMap.getInstance().getSocket(member.username);
      if (memberSocket) memberSocket.emit('newPrivateMessage', messageHTML, receiver);
    });
  } else {
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

router.get('/emergencyContact', async (req, res) => {
  const { username } = req;
  res.send(Result.success(await EmergencyContactController.getEmergencyContact(username)));
});

router.post('/emergencyContact', async (req, res) => {
  const { username } = req;
  const { contact } = req.body;
  const result = await EmergencyContactController.addEmergencyContact(username, contact);
  res.send(Result.success(result));
});

const updateGroupChatContent = async (username) => {
  const memberSocket = socketMap.getInstance().getSocket(username);
  if (!memberSocket) return;
  console.log('update group chat content for', username);
  const emergencyGroups = await EmergencyGroupController.getOpenEmergencyGroupByUser(username);
  const groupsHTML = pug.renderFile('./views/emergencyGroup.pug', { emergencyGroups });
  if (memberSocket) memberSocket.emit('groupChatContentUpdate', groupsHTML);
};

const setToDirectoryPage = async (username) => {
  const memberSocket = socketMap.getInstance().getSocket(username);
  if (!memberSocket) return;
  if (memberSocket) memberSocket.emit('setToDirectoryPage');
};

router.post('/emergencyGroupChat', async (req, res) => {
  const { username } = req;
  const contacts = await EmergencyContactController.getEmergencyContact(username);
  const groupname = `${username}-${Date.now()}`;
  const members = contacts.map((contact) => contact.contact);
  console.log(username, groupname, members);
  const result = await EmergencyGroupController.createEmergencyGroup(groupname, username, members);

  // send group chat update to all members
  members.forEach(async (member) => {
    await updateGroupChatContent(member);
  });
  await updateGroupChatContent(username);

  res.send(Result.success(result));
});

router.get('/emergencyOpenGroupChat', async (req, res) => {
  const { username } = req;
  const result = await EmergencyGroupController.getOpenEmergencyGroupByUser(username);
  res.send(Result.success(result));
});

router.put('/emergencyGroupChat', async (req, res) => {
  // close the group
  const { username } = req;
  const { groupname } = req.body;
  const result = await EmergencyGroupController.closeEmergencyGroup(groupname, username);

  // send group chat update to all members
  const members = await EmergencyGroupController.getMembers(groupname);
  console.log('members', members);
  members.forEach(async (memberObj) => {
    await updateGroupChatContent(memberObj.username);
    await setToDirectoryPage(memberObj.username);
  });

  res.send(Result.success(result));
});

module.exports = router;
