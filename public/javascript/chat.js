// socket
var socket = io();
socket.on('newMessage', function (newMessage) {
    //scroll to the latest post
    $("#dialog").append(newMessage)
    var t = document.body.scrollHeight
    window.scroll({ top: t, left: 0, behavior: 'smooth' })
})

// send post when enter is pressed
function oneKeyPress(e) {
    keynum = e.keyCode | e.which
    // 13 for enter
    if (keynum == 13) sendClick(e)
}

function sendClick() {
    var inputContent = $("#inputContent").val()
    var username = $('#username').val()
    var status = $('#status').val()
    if (inputContent == "" || username == "" || status == "") {
        alert(`input text:${inputContent} or username:${username} or user status:${status} cannot be null`)
        return
    }
    else {
        var message = {
            "sender": username,
            "reciver": "",
            "status": status,
            "timestamp": new Date(),
            "content": inputContent
        }
        axios.post('/api/v1/messages', message).then(function (res) {
            socket.emit('newMessage', message);
            $("#inputContent").val("")
        })
    }
}

$(document).ready(function () {
    axios.get('api/v1/users/current').then(function (res) {
        var username = res.data.data.username
        var status = res.data.data.status
        $('#username').val(username)
        $('#status').val(status)
    }).then(function () {
        axios.get('/chat').then()
    }).catch(function (err) {
        alert(err)
    })
})
