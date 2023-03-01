// socket
socket.on('userlistChange', (updatedContent) => {
  $('#directoryContent').html(updatedContent);
});
