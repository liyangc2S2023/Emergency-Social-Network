const messageController = require('./controller/messageController');
const userController = require('./controller/userController');
const cookieParser = require('cookie-parser')

function formatNotice(text) {
  return {
    sender: "Notice",
    receiver: "all",
    text,
    time: Date.now
  }
}

function setupSocket(server) {
  const io = require('socket.io')(server);

  io.use(function (socket, next) {
    cookieParser()(socket.request, {}, next)
  })
  io.use(function (socket, next) {
    require('./middleware/jwtMW')(socket.request, {}, next)
  })

  io.on('connection', async (socket) => {
    await userController.login(socket.request.username)
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

    // socket.on('newMessage', async (data) => {
    //   try {
    //     //new message
    //     const newMessage = await messageController.addMessage(data.senderName, data.reciverName, data.status, data.content);
    //     io.emit('newMessage', newMessage);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // });

    socket.on('newMessage', async (msg) => {
      try {
        io.emit('newMessage', msg);
      } catch (error) {
        console.log(error);
      }
    });

    //Broadcast when a user disconnects
    socket.on('disconnect', async () => {
      console.log(socket.request.username)
      await userController.logout(socket.request.username)
      io.emit('notice', formatNotice(`${socket.request.username} has left`))
    })
  });
}

module.exports = setupSocket;
