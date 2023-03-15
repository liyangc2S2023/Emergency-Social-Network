const avatar={
  sender:'/image/senderPhoto.jpeg',
  receiver:'/image/photo.jpeg'
}


// socket
socket.on('newMessage', (newMessage,sender) => {
  //scroll to the latest post
  $("#dialog").append(newMessage)
  const username = $('#currentUsername').val();
  $(`.avatar-${sender}`).attr("src",sender==username?avatar.sender:avatar.receiver)
  const t = document.body.scrollHeight;
  window.scroll({ top: t, left: 0, behavior: 'smooth' });
});

// send post when enter is pressed
function oneKeyPress(e) {
  keynum = e.keyCode | e.which;
  // 13 for enter
  if (keynum == 13) sendPublicMessage();
}

function sendPublicMessage() {
  const inputContent = $('#inputContent').val();
  const username = $('#currentUsername').val();
  const status = $('#currentUserStatus').val();
  if (inputContent == '' || username == '' || status == '') {
    alert(`input text:${inputContent} or username:${username} or user status:${status} cannot be null`);
  } else {
    const message = {
      sender: username,
      // 'all' refers to public channel
      receiver: 'all',
      status,
      timestamp: new Date(),
      content: inputContent,
    };
    axios.post('/api/v1/messages', message).then((res) => {
      $('#inputContent').val('');
    });
  }
}

function mainPageBack(){
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
