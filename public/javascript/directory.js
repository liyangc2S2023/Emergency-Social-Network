// socket
socket.on('userRegistered', (updatedContent) => {
  $('#userItems').append(updatedContent);
});
