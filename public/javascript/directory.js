// socket
var socket = io();
socket.on('userlistChange', (updatedContent) => {
    console.log('receive userlistChange call')
    console.log(updatedContent)
    $(".main-page-content").html(updatedContent);
})
