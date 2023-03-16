const avatar = {
  sender: '/image/senderPhoto.jpeg',
  receiver: '/image/photo.jpeg'
}


function scrollDown(currentPage){
  if ($('#currentPage').val() === currentPage) {
    const t = document.body.scrollHeight;
    window.scroll({ top: t, left: 0, behavior: 'smooth' });
  }
}

// socket
socket.on('newMessage', (newMessage, sender) => {
  //scroll to the latest post
  $("#dialog").append(newMessage)
  const username = $('#currentUsername').val();
  $(`.avatar-${sender}`).attr("src", sender == username ? avatar.sender : avatar.receiver);
  scrollDown('publicChatContent');
});

// send post when enter is pressed
function oneKeyPress(e) {
  keynum = e.keyCode | e.which;

  // 13 for enter
  // chat public do not have a certain receiver, but chat private have
  if (keynum == 13) {
    if ($('#currentPage').val() === 'privateChatContent') {
      sendMessage(false);
    } else {
      sendMessage();
    }
  }
}

function sendMessage(isPublic = true) {
  const inputContent = isPublic ? $('#inputContent').val() : $('#privateInputContent').val();
  const username = $('#currentUsername').val();
  const status = $('#currentUserStatus').val();
  // 'all' refers to public channel
  const receiver = isPublic ? 'all' : $('#chatPrivateReceiver').val();
  if (!(inputContent && username && status)) {
    alert(`input text:${inputContent} or username:${username} or user status:${status} cannot be null`);
  } else {
    const message = {
      sender: username,
      receiver,
      status,
      timestamp: new Date(),
      content: inputContent,
    };
    console.log('SEND: send message: ', message);
    if (isPublic) {
      axios.post('/api/v1/messages', message).then((res) => {
        $('#inputContent').val('');
      });
    } else {
      axios.post(`/api/v1/messages/private/${username}/${receiver}`, message).then((res) => {
        $('#privateInputContent').val('');
      });
    }
  }
}

function mainPageBack() {
  displayDirectory();
  $("#main-page-back").hide();
}

$(document).ready(() => {
  axios.get('api/v1/users/current').then((res) => {
    const { username } = res.data.data;
    const { status } = res.data.data;
    $('#currentUsername').val(username);
    $('#currentUserStatus').val(status);
  }).catch((err) => {
    alert(err);
  });
});
