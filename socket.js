const messageController = require('./controller/messageController');
const userController = require('./controller/userController');
const cookieParser = require('cookie-parser')
const pug = require('pug')
const date2Str = require('./utils/dateUtil.js')

function formatNotice(text) {
  return {
    sender: "Notice",
    receiver: "all",
    text,
    time: Date.now
  }
}

function setupSocket(io) {

  io.use(function (socket, next) {
    cookieParser()(socket.request, {}, next)
  })
  io.use(function (socket, next) {
    require('./middleware/jwtMW')(socket.request, {}, next)
  })

  io.on('connection', async (socket) => {
    await userController.login(socket.request.username)
    console.log("connection")
    var userList = await userController.getAll();
    var userListHTML = pug.renderFile('./views/directory.pug', { users: userList })
    socket.broadcast.emit('userlistChange', userListHTML)

    socket.on('joinRoom', async (username) => {
      //socket.join('$room');
      socket.join('');
      //history message
      socket.emit('historyMessage', messageController.getAll());
      //welcome
      socket.emit('notice', formatNotice(`${username} has joined`));
      //Broadcast wehen a user connects
      socket.broadcast.emit('notice', formatNotice(`${username} has joined`))
    });

    socket.on('newMessage', async (msg) => {
      var sender = msg.sender
      var message = msg.content
      var date = date2Str(new Date(msg.timestamp))
      // TODO: move statusMap to a global file
      var statusMap = {
        "undefined": "circle outline icon",
        "ok": "",
        "help": "",
        "emergency": ""
      }
      var statusStyle = statusMap[msg.status]
      try {
        var messageListHTML = pug.renderFile('./views/message.pug', { sender: sender, message: message, time: date, statusStyle: statusStyle })
        io.emit('newMessage', messageListHTML)
      } catch (error) {
        console.log(error);
      }
    });

    socket.on('disconnect', async () => {
      await userController.logout(socket.request.username)
      console.log('user disconnected');

      var userList = await userController.getAll();
      var userListHTML = pug.renderFile('./views/directory.pug', { users: userList })
      socket.broadcast.emit('userlistChange', userListHTML)
    })

  });
}

module.exports = setupSocket;
