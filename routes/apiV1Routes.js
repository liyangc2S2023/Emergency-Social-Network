const express = require('express');
const pug = require('pug');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });
const s3 = require('../s3');
const Result = require('./common/result');
const messageController = require('../controller/messageController');
const userController = require('../controller/userController');
const statusController = require('../controller/statusController');
const searchController = require('../controller/searchController');
const announcementController = require('../controller/announcementController');
const blogController = require('../controller/blogController');
const commentController = require('../controller/commentController');
const emergencyRecordController = require('../controller/emergencyRecordController');
const fixOrderController = require('../controller/fixOrderController');
const socketMap = require('../utils/socketMap');
const config = require('../config');
const date2Str = require('../utils/dateUtil');
const SupplyController = require('../controller/supplyController');
const ExchangeController = require('../controller/exchangeController');
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

// eslint-disable-next-line max-len
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

// eslint-disable-next-line max-len
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
    req.role,
  );
  if (req.role === config.USER_ROLE.COORDINATOR || req.role === config.USER_ROLE.ADMIN) {
    ancm.time = date2Str(new Date(req.body.timestamp));
    const announcementHTML = pug.renderFile('./views/announcement.pug', { ancm });
    req.io.emit('newAnnouncement', announcementHTML);
    return res.send(Result.success(result));
  }
  return res.send(Result.fail('You are not authorized to post announcements'));
});

router.get('/search', async (req, res) => {
  const {
    context, criteria, sender, receiver, page,
  } = req.query;
  const searchResult = await searchController.searchContent(context, criteria.split(','), sender, receiver, page);
  res.send(Result.success(searchResult));
});

router.post('/supplies', async (req, res) => {
  const {
    name, quantity, category,
  } = req.body;
  const result = await SupplyController.createSupply(name, quantity, category, req.username);
  const supplyHTML = pug.renderFile('./views/supplyItem.pug', { supply: result });
  const selfSupplyHTML = pug.renderFile('./views/supplyItem.pug', { supply: result, currentUsername: req.username });

  const senderSocket = socketMap.getInstance().getSocket(req.username);
  if (senderSocket) { senderSocket.emit('selfNewSupply', selfSupplyHTML); }

  req.io.emit('newSupply', supplyHTML, req.username);

  return res.send(Result.success(result));
});

router.get('/supplies', async (req, res) => {
  const result = await SupplyController.getAllRemainingSupplies();
  return res.send(Result.success(result));
});

router.post('/supplies/:supplyId', async (req, res) => {
  const { supplyId } = req.params;
  const { name, quantity, category } = req.body;
  const result = await SupplyController.updateSupply(supplyId, name, quantity, category);

  req.io.emit('changeSupply', result);

  return res.send(Result.success(result));
});

router.post('/exchange/:senderId/:receiverId', async (req, res) => {
  const result = await ExchangeController.createExchange(req.body);
  const exchangeHtml = pug.renderFile('./views/exchangeItem.pug', { exchange: result, currentUser: req.username });
  // eslint-disable-next-line max-len
  const selfExchangeHtml = pug.renderFile('./views/exchangeItem.pug', { exchange: result, currentUser: req.username, currentUsername: req.username });

  // send to sender
  const senderSocket = socketMap.getInstance().getSocket(req.params.senderId);
  if (senderSocket) { senderSocket.emit('newExchange', selfExchangeHtml); }

  // send to receiver
  const receiverSocket = socketMap.getInstance().getSocket(req.params.receiverId);
  if (receiverSocket) { receiverSocket.emit('newExchange', exchangeHtml); }

  return res.send(Result.success(result));
});

router.post('/exchange/rejection', async (req, res) => {
  const result = await ExchangeController.rejectExchange(req.body.id);

  // send to sender
  const requesterSocket = socketMap.getInstance().getSocket(req.body.requester);
  if (requesterSocket) { requesterSocket.emit('exchangeRejected', req.body.id); }
  return res.send(Result.success(result));
});

router.post('/exchange/cancellation', async (req, res) => {
  const result = await ExchangeController.cancelExchange(req.body.id);

  // send to receiver
  const dealerSocket = socketMap.getInstance().getSocket(req.body.dealer);
  if (dealerSocket) { dealerSocket.emit('exchangeCancelled', req.body.id); }
  return res.send(Result.success(result));
});

router.post('/exchange/acception', async (req, res) => {
  const ifSufficent = await ExchangeController.hasSufficientQuantity(req.body.id);
  if (ifSufficent < 0) {
    return res.send(Result.fail('Insufficient quantity', ifSufficent));
  }
  const result = await ExchangeController.acceptExchange(req.body.id);

  // send to sender
  const requesterSocket = socketMap.getInstance().getSocket(req.body.requester);
  if (requesterSocket) { requesterSocket.emit('exchangeAccepted', req.body.id); }

  req.io.emit('supplyQuantityChange', result.supplyID, ifSufficent);

  return res.send(Result.success(result));
});

/**
 * get all blogs
 */
router.get('/blogs', async (req, res) => {
  const result = await blogController.getAllBlogs();
  res.send(Result.success(result));
});

/**
 * get a blog by id
 */
router.get('/blogs/:blogId', async (req, res) => {
  const blog = await blogController.getBlogById(req.params.blogId);
  // set attributes for ui rendering
  blog.time = date2Str(new Date(blog.timestamp));
  blog.isAuthor = (req.username === blog.author);
  blog.comments = await commentController.getCommentsByReplyTo(req.params.blogId);
  if (blog.comments) {
    blog.comments.forEach(async (comment) => {
      comment.time = date2Str(new Date(comment.timestamp));
      comment.isAuthor = (comment.author === blog.author);
    });
  }
  // send a socket to update blog view ui
  const blogViewHTML = pug.renderFile('./views/blogDetails.pug', { blog });
  const userSocket = socketMap.getInstance().getSocket(req.username);
  if (userSocket) userSocket.emit('viewBlog', blogViewHTML);
  // update commnet reply ui
  if (blog.comments) {
    blog.comments.forEach(async (comment) => {
      const replies = await commentController.getCommentsByReplyTo(comment.id);
      replies.forEach((reply) => {
        userSocket.emit('updateReplyTo', reply.replyTo);
        reply.time = date2Str(new Date(reply.timestamp));
        reply.isAuthor = (reply.author === blog.author);
        reply.replyToUser = comment.author;
        const replyHTML = pug.renderFile('./views/blogReply.pug', { reply });
        if (userSocket) userSocket.emit('postReply', replyHTML, blog.id, reply.replyTo);
      });
    });
  }
  res.send(Result.success(blog));
});

/**
 * post a blog
 */
router.post('/blogs', async (req, res) => {
  const input = req.body;
  if (!input.image || input.image.trim() === '') input.image = config.DEFAULT_BLOG_IMAGE;
  // eslint-disable-next-line max-len
  const blog = await blogController.addBlog(req.username, input.title, input.tag, input.content, input.image);
  blog.time = date2Str(new Date(blog.timestamp));
  blog.isAuthor = (req.username === blog.author);
  // send a socket to update blog board ui
  const blogBriefHTML = pug.renderFile('./views/blogBrief.pug', { blog });
  req.io.emit('postBlog', blogBriefHTML, blog);
  res.send(Result.success(blog));
});

/**
 * update a blog by the author
 */
router.put('/blogs/:blogId', async (req, res) => {
  const input = req.body;
  if (!input.image || input.image.trim() === '') input.image = config.DEFAULT_BLOG_IMAGE;
  try {
    // eslint-disable-next-line max-len
    const blog = await blogController.updateBlog(req.params.blogId, req.username, input.title, input.tag, input.content, input.image);
    blog.time = date2Str(new Date(blog.timestamp));
    blog.isAuthor = (req.username === blog.author);
    // send a socket to update blog board ui
    const blogBriefHTML = pug.renderFile('./views/blogBrief.pug', { blog });
    req.io.emit('editBlog', blogBriefHTML, blog);
    res.send(Result.success(blog));
  } catch (error) {
    res.status(400);
    res.send(Result.fail());
  }
});

/**
 * delete a blog
 */
router.delete('/blogs/:blogId', async (req, res) => {
  try {
    const blog = await blogController.getBlogById(req.params.blogId);
    // delete blog
    const result = await blogController.deleteBlog(req.params.blogId, req.username);
    // delete comments of the blog
    await commentController.deleteCommentsByBlogId(req.params.blogId);
    // delete image from s3
    if (blog.image && blog.image !== config.DEFAULT_BLOG_IMAGE) {
      const params = {
        Bucket: config.S3.bucketName,
        Key: blog.image,
      };
      s3.deleteObject(params, (err) => {
        if (err) {
          console.log('Error deleting file from S3: ', err);
        } else {
          console.log('File deleted from S3 successfully.');
        }
      });
    }
    req.io.emit('deleteBlog', req.params.blogId);
    res.send(Result.success(result));
  } catch (error) {
    res.status(400);
    res.send(Result.fail());
  }
});

/**
 * upload a file to AWS S3
 */
router.post('/uploadImage', upload.single('file'), (req, res) => {
  const params = {
    Bucket: config.S3.bucketName,
    Key: req.file.originalname,
    Body: req.file.buffer,
    ACL: 'public-read',
  };
  s3.upload(params, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error uploading file');
    } else {
      console.log(`File uploaded successfully. URL: ${data.Location}`);
      res.send(Result.success(data));
    }
  });
});

/**
 * update likes to a blog
 */
router.put('/blogs/:blogId/likes', async (req, res) => {
  const blog = await blogController.updateLikes(req.params.blogId, req.body.likes);
  req.io.emit('updateBlogLikes', blog.id, blog.likes);
  res.send(Result.success(blog));
});

/**
 * get all comments of a blog or a comment
 */
router.get('/blogs/comments/:replyTo', async (req, res) => {
  const result = await commentController.getCommentsByReplyTo(req.params.replyTo);
  res.send(Result.success(result));
});

/**
 * post a comment to a blog or a comment
 */
router.post('/blogs/comments', async (req, res) => {
  // add a comment
  // eslint-disable-next-line max-len
  const comment = await commentController.addComment(req.body.blogId, req.body.replyTo, req.username, req.body.content);
  // set params to render a comment html
  const blog = await blogController.getBlogById(req.body.blogId);
  const replyToComment = await commentController.getCommentById(comment.replyTo);
  const replyToBlog = await blogController.getBlogById(comment.replyTo);
  comment.time = date2Str(new Date(comment.timestamp));
  comment.isAuthor = comment.author === blog.author;
  // send a socket to update comment ui
  if (replyToBlog) {
    const commentHTML = pug.renderFile('./views/blogComment.pug', { comment });
    // const userSocket = socketMap.getInstance().getSocket(req.username);
    // if (userSocket) userSocket.emit('postComment', commentHTML, blog.id);
    req.io.emit('postComment', commentHTML, blog.id);
  }
  if (replyToComment) {
    const reply = comment;
    reply.replyToUser = replyToComment.author;
    const replyHTML = pug.renderFile('./views/blogReply.pug', { reply });
    // const userSocket = socketMap.getInstance().getSocket(req.username);
    // if (userSocket) userSocket.emit('postReply', replyHTML);
    req.io.emit('postReply', replyHTML, blog.id, reply.replyTo);
  }
  res.send(Result.success(comment));
});

/**
 * delete a comment
 */
router.delete('/blogs/comments/:commentId', async (req, res) => {
  const result = await commentController.deleteComment(req.params.commentId);
  res.send(Result.success(result));
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

// emergency request
router.get('/emergencyRequests/:id', async (req, res) => {
  const { id } = req.params;
  res.send(Result.success(await emergencyRecordController.getById(id)));
});

router.get('/emergencyRequests', async (req, res) => {
  res.send(Result.success(await emergencyRecordController.getAllHelpRequest()));
});

router.post('/emergencyRequests', async (req, res) => {
  const name = req.username;
  const { location, formResult } = req.body;
  const result = await emergencyRecordController.startReqShareAndSaveRecord(req, name, location, formResult);
  res.send(Result.success(result));
});

router.put('/emergencyRequests/:id/done', async (req, res) => {
  const { id } = req.params;
  const result = await emergencyRecordController.receiveLocationShare(req, id);
  res.send(Result.success(result));
});

router.put('/emergencyRequests/:id', async (req, res) => {
  const { id } = req.params;
  const { location } = req.body;
  const result = await emergencyRecordController.updateLocation(req, id, location);
  res.send(Result.success(result));
});

router.delete('/emergencyRequests/:id', async (req, res) => {
  const { id } = req.params;
  const result = await emergencyRecordController.cancelLocationShare(req, id);
  res.send(Result.success(result));
});

// emergency response
router.post('/emergencyResponses', async (req, res) => {
  const name = req.username;
  const { location, target } = req.body;
  const result = await emergencyRecordController.startResShareAndSaveRecord(req, name, location, target);
  res.send(Result.success(result));
});

router.put('/emergencyResponses/:id/done', async (req, res) => {
  const { id } = req.params;
  const result = await emergencyRecordController.receiveLocationShare(req, id);
  res.send(Result.success(result));
});

router.put('/emergencyResponses/:id', async (req, res) => {
  const { id } = req.params;
  const { location } = req.body;
  const result = await emergencyRecordController.updateLocation(req, id, location);
  res.send(Result.success(result));
});

router.delete('/emergencyResponses/:id', async (req, res) => {
  const { id } = req.params;
  const result = await emergencyRecordController.cancelLocationShare(req, id);
  res.send(Result.success(result));
});

router.get('/emergencyResponses/target/:id', async (req, res) => {
  const { id } = req.params;
  const result = await emergencyRecordController.getHelpResponseOf(id);
  res.send(Result.success(result));
});

router.post('/role', async function (req, res) {
  const roleChangeResult = await fixOrderController.changeRole(req.body.username, req.body.role);
  const role = await fixOrderController.getUserRole(req.body.username);
  req.io.emit('roleChange', { username: req.body.username, role });
  return res.send(Result.success({ role }));
});

router.post('/powerreport', async function (req, res) {
  const userPowerStatus = await fixOrderController.createFixOrder(req.body.username, req.body.description, req.body.userAddress, req.body.powerStatus);
  const powerStatus = await fixOrderController.getFixOrderStatus(req.body.username);
  return res.send(Result.success({ powerStatus }));
});


router.get('/initialrole', async function (req, res) {
  const role = await fixOrderController.getUserRole(req.username);
  res.send(Result.success({ role }));
});

router.get('/powerIssueList', async function (req, res) {
  const fixOrder = await fixOrderController.getUnfixOrders();
  res.send(Result.success({ fixOrder }));
});

router.post('/fixorder', async function (req, res) {
  console.log(req.body);
  const { sender, helper, status } = req.body;
  const userPowerStatus = await fixOrderController.updateFixOrderByElectrian(sender, helper, status);
  const powerStatus = await fixOrderController.getFixOrderStatus(sender);
  return res.send(Result.success({ powerStatus }));
});

module.exports = router;
