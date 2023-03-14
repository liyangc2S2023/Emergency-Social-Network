const pug = require('pug');
const messageController = require('../../controller/messageController');
const userController = require('../../controller/userController');
const date2Str = require('../../utils/dateUtil');
const config = require('../../config');

async function renderOnePage(req, res, pageView) {
  // make user online
  await userController.login(req.username);

  const messageList = await messageController.getAll();
  messageList.forEach((msg) => {
    msg.isSender = (req.username === msg.sender);
    msg.time = date2Str(new Date(msg.timestamp));
    msg.statusStyle = config.statusMap[msg.status];
  });

  // data preparation for directory page
  const userList = await userController.getAll();

  // render main page with all data
  res.render('mainPage', { pageView, users: userList, messages: messageList });

  const userListHTML = pug.renderFile('./views/directory.pug', { users: userList });
  req.io.emit('userlistChange', userListHTML);
}

module.exports = renderOnePage;
