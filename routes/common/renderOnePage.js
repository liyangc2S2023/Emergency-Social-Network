const messageController = require('../../controller/messageController');
const userController = require('../../controller/userController');
const statusController = require('../../controller/statusController');
const announcementController = require('../../controller/announcementController');
const supplyController = require('../../controller/supplyController');
const blogController = require('../../controller/blogController');
const emergencyContactController = require('../../controller/emergencyContactController');
const emergencyGroupController = require('../../controller/emergencyGroupController');
const fixOrderController = require('../../controller/fixOrderController');
const date2Str = require('../../utils/dateUtil');
const config = require('../../config');
const ExchangeController = require('../../controller/exchangeController');

async function renderOnePage(req, res, pageView) {
  // make user online
  await userController.login(req.username);

  const messageList = await messageController.getMessageByReceiverOrRoom('all');
  messageList.forEach((msg) => {
    msg.isSender = (req.username === msg.sender);
    msg.time = date2Str(new Date(msg.timestamp));
    msg.statusStyle = config.statusMap[msg.status];
  });

  const announcementList = await announcementController.getAll();
  announcementList.forEach((ancm) => {
    ancm.time = date2Str(new Date(ancm.timestamp));
  });

  const blogList = await blogController.getAllBlogs();
  blogList.forEach(async (blog) => {
    blog.time = date2Str(new Date(blog.timestamp));
    blog.isAuthor = (req.username === blog.author);
  });

  // data preparation for directory page
  const userList = await userController.getAll();
  userList.forEach((user) => {
    user.statusStyle = config.statusMap[user.status];
  });

  // supply list
  const supplyList = await supplyController.getAllRemainingSupplies();

  const exchangeList = await ExchangeController.getExchangesByUser(req.username);

  // emergency groups
  const emergencyGroups = await emergencyGroupController.getOpenEmergencyGroupByUser(req.username);
  // console.log('emergencyGroups', emergencyGroups);

  // current user status
  let status = await statusController.getStatus(req.username);
  const emergencyContacts = await emergencyContactController.getEmergencyContact(req.username);
  // if status is undefined, set it to 'undefined'
  status = status || 'undefined';

  // current user role. Initially, role = user, and the role will transmit to MainPage.js

  const powerStatus = await fixOrderController.getFixOrderStatus(req.username);

  const unfixedOrderList = await fixOrderController.getUnfixOrders();

  // current user role. Initially, role = user, and the role will transmit to MainPage.js
  let role = await fixOrderController.getUserRole(req.username);
  role = role || 'user';

  console.log(req.role);
  // render main page with all data
  res.render('mainPage', {
    currentUsername: req.username,
    pageView,

    users: userList,

    messages: messageList,

    status,

    announcements: announcementList,
    role,
    powerStatus: powerStatus,
    unfixedOrderLists: unfixedOrderList,
    supplies: supplyList,
    exchanges: exchangeList,
    emergencyContacts,
    currentRole: req.role,
    emergencyGroups,
    blogs: blogList,
  });
}

module.exports = renderOnePage;
