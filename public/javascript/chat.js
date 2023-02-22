var statusMap = {"undefined":"circle outline icon",
                 "ok":"",
                 "help":"",
                 "emergency":""}

var newMsg=function(msg,isSender){
    if(isSender){
        return $(`<div class='comment sendMsg'>
                    <a class='avatar'><img src="https://semantic-ui.com/images/avatar/small/matt.jpg"></a>
                    <div class='content msg-top'>
                        <a class='author name'>${msg.sender}</a>
                        <div class='metadata'>
                            <i class='${statusMap[msg.status]}'></i>
                            <div class='time'>${date2Str(new Date(msg.timestamp))}</div>
                        </div>
                        <div class='text'>${$("<div/>").text(msg.content).html()}</div>
                    </div>
                </div>`)
    }
    else{
        return $(`<div class='comment receiveMsg'>
                    <a class='avatar'><img src="https://semantic-ui.com/images/avatar/small/elliot.jpg"></a>
                    <div class='content msg-top'>
                        <a class='author name'>${msg.sender}</a>
                        <div class='metadata'>
                            <i class='${statusMap[msg.status]}'></i>
                            <div class='time'>${date2Str(new Date(msg.timestamp))}</div>
                        </div>
                        <div class='text'>${$("<div/>").text(msg.content).html()}</div>
                    </div>
                </div>`)
    }
}

// socket
var socket = io();
socket.on('newMessage',function(msg){
  //scroll to the latest post
  $("#dialog").append(newMsg(msg,msg.sender==$('#username').val()))
  var t = document.body.scrollHeight;
  window.scroll({ top: t, left: 0, behavior: 'smooth' });
})

// send post when enter is pressed
function oneKeyPress(e){
    keynum = e.keyCode | e.which
    // 13 for enter
    if(keynum == 13) sendClick(e)
}

function sendClick(){
    var inputContent = $("#inputContent").val()
    var username = $('#username').val()
    var status = $('#status').val()
    if(inputContent=="" || username=="" || status==""){
        alert(`input text:${inputContent} or username:${username} or user status:${status} cannot be null`)
        return
    }
    else{
        var message = {
            "sender":username,
            "reciver":"",
            "status":status,
            "timestamp":new Date(),
            "content":inputContent
        }
        axios.post('/api/v1/messages',message).then(function(res){
            socket.emit('newMessage',message);
            $("#inputContent").val("")
        })
    }
}

$(document).ready(function(){
    axios.get('api/v1/users/current').then(function(res){
        var username = res.data.data.username
        var status = res.data.data.status
        $('#username').val(username)
        $('#status').val(status)
    }).then(function(){
        axios.get('/api/v1/messages').then(function(res){
            result=res.data
            if(result.success){
                for(var msg of result.data){
                    $("#dialog").append(newMsg(msg,$('#username').val()==msg.sender))
                }
                var t = document.body.scrollHeight;
                window.scroll({ top: t, left: 0, behavior: 'smooth' });
            }
        })
    }).catch(function(err){
        alert(err)
    })
})
