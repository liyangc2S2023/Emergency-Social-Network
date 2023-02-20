var newMsg=function(msg,isSender){
    if(isSender){
        return $(`<div class='comment sendMsg'>
                    <a class='avatar'><img src="https://semantic-ui.com/images/avatar/small/matt.jpg"></a>
                    <div class='content msg-top'>
                        <a class='author name'>${msg.sender}</a>
                        <div class='metadata'>
                            <img class="status" src="/icons/okIcon.png" alt="${msg.status}"/>
                            <div class='time'>${msg.timestamp}</div>
                        </div>
                        <div class='text'>${msg.content}</div>
                    </div>
                </div>`)
    }
    else{
        return $(`<div class='comment receiveMsg'>
                    <a class='avatar'><img src="https://semantic-ui.com/images/avatar/small/elliot.jpg"></a>
                    <div class='content msg-top'>
                        <a class='author name'>${msg.sender}</a>
                        <div class='metadata'>
                            <img class="status" src="/icons/okIcon.png" alt="${msg.status}"/>
                            <div class='time'>${msg.timestamp}</div>
                        </div>
                        <div class='text'>${msg.content}</div>
                    </div>
                </div>`)
    }
}

// socket
var socket = io();
socket.on('newMessage',function(msg){
  //scroll to the latest post
  $("#dialog").append(newMsg(msg,false))
  var t = document.body.scrollHeight;
  window.scroll({ top: t, left: 0, behavior: 'smooth' });
})

function sendClick(){
    // todo: finish status
    // if($("#inputText").val()=="" || 
    //     $('#username').val()=="" || 
    //     $('#status').val()==""){
    //     return
    // }
    // else{
    var message = {
        "sender":$('#username').val(),
        "reciver":"",
        "status":$('#status').val(),
        "timestamp":new Date(),
        "content":$("#inputText").val()
    }
    axios.post('/api/v1/messages',message).then(function(res){
        socket.emit('newMessage',message);
        $("#inputText").val("")
    })
    // }
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
            }
        })
    }).catch(function(err){
        alert(err)
    })
})
