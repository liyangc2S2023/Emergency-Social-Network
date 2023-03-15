const cookieParser = require('cookie-parser');
const pug = require('pug');
const jwtMW = require('./middleware/jwtMW');
const messageController = require('./controller/messageController');
const userController = require('./controller/userController');
const config = require('./config');
const socketMap = require('./utils/socketMap');

function formatNotice(text) {
  return {
    sender: 'Notice',
    receiver: 'all',
    text,
    time: Date.now,
  };
}

function setupSocket(io) {
  io.use((socket, next) => {
    cookieParser()(socket.request, {}, next);
  });
  io.use((socket, next) => {
    jwtMW(socket.request, {}, next);
  });

  io.on('connection', async (socket) => {
    await userController.login(socket.request.username);
    console.log('connection');

    // add user to socketMap
    socketMap.getInstance().addSocket(socket.request.username, socket);

    // a new user logged in
    socket.broadcast.emit('userLogin', socket.request.username);

    socket.on('joinRoom', async (username) => {
      // socket.join('$room');
      socket.join('');
      // history message
      socket.emit('historyMessage', messageController.getAll());
      // welcome
      socket.emit('notice', formatNotice(`${username} has joined`));
      // Broadcast wehen a user connects
      socket.broadcast.emit('notice', formatNotice(`${username} has joined`));
    });

    socket.on('disconnect', async () => {
      await userController.logout(socket.request.username);
      console.log('user disconnected');
      socketMap.getInstance().removeSocket(socket.request.username);
      // Broadcast when a user disconnects
      socket.broadcast.emit('userLogout', socket.request.username);
    });
  });
}

module.exports = setupSocket;
