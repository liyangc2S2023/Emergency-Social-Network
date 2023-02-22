// socket
var socket = io();
socket.on('userlistChange', (updatedContent) => {
    console.log('receive userlistChange call')
    console.log(updatedContent)
    $(".main-page-content").html(updatedContent);
    var t = document.body.scrollHeight;
    window.scroll({ top: t, left: 0, behavior: 'smooth' })
})

// when document is ready
$(document).ready( () => {
    console.log('emit event userOnline')
    console.log(socket)
    socket.emit("userOnline")
});