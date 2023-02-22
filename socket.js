const cookieParser = require('cookie-parser');
const pug = require('pug');
const jwtMW = require('./middleware/jwtMW');
const messageController = require('./controller/messageController');
const userController = require('./controller/userController');
const date2Str = require('./utils/dateUtil');

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
    let userList = await userController.getAll();
    let userListHTML = pug.renderFile('./views/directory.pug', { users: userList });
    socket.broadcast.emit('userlistChange', userListHTML);

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

    socket.on('newMessage', async (msg) => {
      msg.isSender = true;
      msg.time = date2Str(new Date(msg.timestamp));
      // TODO: move statusMap to a global file
      const statusMap = {
        undefined: 'circle outline icon',
        ok: '',
        help: '',
        emergency: '',
      };
      msg.statusStyle = statusMap[msg.status];
      try {
        const messageListHTML = pug.renderFile('./views/message.pug', { msg });
        io.emit('newMessage', messageListHTML);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on('disconnect', async () => {
<<<<<<< HEAD
      await userController.logout(socket.request.username);
      console.log('user disconnected');

      userList = await userController.getAll();
      userListHTML = pug.renderFile('./views/directory.pug', { users: userList });
      socket.broadcast.emit('userlistChange', userListHTML);
    });
=======
      console.log(socket.request.username)
      await userController.logout(socket.request.username)
      io.emit('notice', formatNotice(`${socket.request.username} has left`))
    })
>>>>>>> fix bug in welcome page
  });
}

module.exports = setupSocket;
