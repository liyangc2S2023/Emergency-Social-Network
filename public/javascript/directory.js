// socket
socket.on('userRegistered', (updatedContent) => {
  
  $('#userItems').append(updatedContent);
  // reorderDirectory()
  console.log(updatedContent);
});
