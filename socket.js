const messageController = require('./controller/messageController');

function formatNotice(text) {
    return {
        sender:"Notice",
        receiver:"all",
        text,
        time: Date.now
    }
}

function setupSocket(server) {
  const io = require('socket.io')(server);

  io.on('connection', (socket) => {
    console.log('New socket connection...');

    socket.on('joinRoom', async (username) => {

        console.log("connect .....")
        

        //socket.join('$room');
        socket.join('');

        //history message
        socket.emit('historyMessage', messageController.getAll());  

        //welcome
        socket.emit('notice', formatNotice(`${username} has joined`));

        //Broadcast wehen a user connects
        socket.broadcast.emit('notice',formatNotice(`${username} has joined`))
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
    socket.on('disconnect', async (username) => {

        if(username) {
            io.emit('notice',formatNotice(`${username} has left`));
        }

    })

  });
}

module.exports = setupSocket;
