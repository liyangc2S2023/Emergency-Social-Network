const messageController = require('../../controller/messageController');
const userController = require('../../controller/userController');
const statusController = require('../../controller/statusController');
const date2Str = require('../../utils/dateUtil');
const config = require('../../config');

async function renderOnePage(req, res, pageView) {
  // make user online
  await userController.login(req.username);

  const messageList = await messageController.getBySender("all");
  messageList.forEach((msg) => {
    msg.isSender = (req.username === msg.sender);
    msg.time = date2Str(new Date(msg.timestamp));
    msg.statusStyle = config.statusMap[msg.status];
  });

  // data preparation for directory page
  const userList = await userController.getAll();
  userList.forEach((user) => {
    user.statusStyle = config.statusMap[user.status];
  });

  // current user status
  let status = await statusController.getStatus(req.username);
  // if status is undefined, set it to 'undefined'
  status = status || 'undefined';

  // render main page with all data
  res.render('mainPage', {
    pageView, users: userList, messages: messageList, status,
  });
}

module.exports = renderOnePage;
