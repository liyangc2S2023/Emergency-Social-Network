const messageController = require('../controller/messageController');

function setupSocket(server) {
  const io = require('socket.io')(server);

  io.on('connection', (socket) => {
    console.log('New socket connection...');

    socket.on('joinRoom', async (username) => {

        console.log("connect .....")
        
        //fetch username
        const user = username;

        //socket.join('$room');
        socket.join('');

        //history message
        socket.emit('historyMessage', messageController.getAll());  

        //welcome
        socket.emit('notice', formatNotice('Notice',`${user.username} has joined`));

        //Broadcast wehen a user connects
        socket.broadcast.emit('notice',formatNotice('Notice',`${user.username} has joined`))
    });
    

    socket.on('newMessage', async (data) => {
      try {

        //uncertain: get username from cookie
        var cookies = cookie.parse(socket.handshake.headers.cookie);

        const username = cookies.userName;

        //new message
        const newMessage = await messageController.addMessage(data.senderName, data.reciverName, data.status, data.content);
        
        io.emit('newMessage', newMessage);
        
      } catch (error) {
        
        console.log(error);
      }
    });


    //Broadcast when a user disconnects
    socket.on('disconnect', async () => {
        const user = userLeave(socket.id);

        if(user) {
            io.emit('notice',messageController.formatNotice(`${user.username} has left`));
        }

    })

  });
}

module.exports = setupSocket;
