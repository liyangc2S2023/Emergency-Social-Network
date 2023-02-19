// socket
// var socket = io();
// socket.on('update',function(msg){
//   //scroll to the latest post
//   $("#dialog").append(newMsg(msg,false))
//   var t = document.body.scrollHeight;
//   window.scroll({ top: t, left: 0, behavior: 'smooth' });
// })

var newMsg=function(msg,isSender){
    if(isSender){
        return $(`<div class='sendMsg'><div class='msg-top'><div class='name'>${msg.sender}</div><div class='status'>${msg.status}</div></div><div class='msg-content'><div class='msg'>${msg.content}</div><div class='time'>${msg.timestamp}</div></div></div>`)
    }
    else{
        return $(`<div class='receiveMsg'><div class='msg-top'><div class='name'>${msg.sender}</div><div class='status'>${msg.status}</div></div><div class='msg-content'><div class='msg'>${msg.content}</div><div class='time'>${msg.timestamp}</div></div></div>`)
    }
}

function sendClick(){
    if($("#inputText").val()=="" || 
        $('#username').val()=="" || 
        $('#status').val()==""){
        return
    }
    else{
        var message = {
            "sender":$('#username').val(),
            "reciver":"",
            "status":$('#status').val(),
            "timestamp":new Date(),
            "content":$("#inputText").val()
        }
        axios.post('/api/v1/messages',message).then(function(res){
            // if(!post) return;
            // socket.emit('post',message);
            $("#inputText").val("")
            // $("#dialog").append(newMsg(msg,false))
        })
    }
}

$(document).ready(function(){
    axios.get('api/v1/users/current').then(function(res){
        if(res.success){
            var username = res.data.data.username
            var status = res.data.data.status
            $('#username').val(username)
            $('#status').val(status)
        }
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
