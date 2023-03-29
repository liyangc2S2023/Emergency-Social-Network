const express = require('express');
const Result = require('./common/result');
const router = express.Router();
const pug = require('pug');

const date2Str = require('../utils/dateUtil');
const config = require('../config');
const searchController = require('../controller/searchController');

const transformMessage = (msg) => {
  const {
    sender, receiver, status, content, timestamp,
  } = msg;
  return {
    sender,
    receiver,
    statusStyle: config.statusMap[status],
    content,
    time: date2Str(timestamp),
  };
};

const transformMessageList = (msgList) => {
  const transformedList = [];
  msgList.forEach((msg) => {
    transformedList.push(transformMessage(msg));
  });
  return transformedList;
};

const transfromUserList = (userList) => {
  const transformedList = [];
  userList.forEach((user) => {
    transformedList.push({
      username: user.username,
      statusStyle: config.statusMap[user.status],
    });
  });
  return transformedList;
};

router.get('/', async (req, res) => {
  const {
    context, criteria, sender, receiver, page,
  } = req.query;
  const searchResult = await searchController.searchContent(context, criteria.split(','), sender, receiver, page);
  let renderedResult = '';
  const resultsLength = searchResult.length;
  if (context.indexOf('Message') !== -1) {
    renderedResult = pug.renderFile('./views/messageList.pug', { messages: transformMessageList(searchResult) });
  } else if (['announcement'].includes(context)) {
    renderedResult = pug.renderFile('./views/announcementList.pug', { announcements: searchResult });
  } else if (['username', 'status'].includes(context)) {
    renderedResult = pug.renderFile('./views/directory.pug', { users: transfromUserList(searchResult) });
  }
  res.send(Result.success({ renderedResult, resultsLength }));
});

module.exports = router;
