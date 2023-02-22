// socket
var socket = io();
socket.on('userlistChange', (updatedContent) => {
    $(".main-page-content").html(updatedContent);
    var t = document.body.scrollHeight;
    window.scroll({ top: t, left: 0, behavior: 'smooth' });
})