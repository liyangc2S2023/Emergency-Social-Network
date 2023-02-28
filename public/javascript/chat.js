// socket
const socket = io();
socket.on('newMessage', (msg) => {
  // scroll to the latest post
  $('#dialog').append(newMsg(msg, msg.sender == $('#username').val()));
  const t = document.body.scrollHeight;
  window.scroll({ top: t, left: 0, behavior: 'smooth' });
});

// send post when enter is pressed
function oneKeyPress(e) {
  keynum = e.keyCode | e.which;
  // 13 for enter
  if (keynum == 13) sendClick(e);
}

function sendClick() {
  const inputContent = $('#inputContent').val();
  const username = $('#username').val();
  const status = $('#status').val();
  if (inputContent == '' || username == '' || status == '') {
    alert(`input text:${inputContent} or username:${username} or user status:${status} cannot be null`);
  } else {
    const message = {
      sender: username,
      reciver: '',
      status,
      timestamp: new Date(),
      content: inputContent,
    };
    axios.post('/api/v1/messages', message).then((res) => {
      socket.emit('newMessage', message);
      $('#inputContent').val('');
    });
  }
}

$(document).ready(() => {
  axios.get('api/v1/users/current').then((res) => {
    const { username } = res.data.data;
    const { status } = res.data.data;
    $('#username').val(username);
    $('#status').val(status);
  }).then(() => {
    axios.get('/api/v1/messages').then((res) => {
      result = res.data;
      if (result.success) {
        for (const msg of result.data) {
          $('#dialog').append(newMsg(msg, $('#username').val() == msg.sender));
        }
        const t = document.body.scrollHeight;
        window.scroll({ top: t, left: 0, behavior: 'smooth' });
      }
    });
  }).catch((err) => {
    alert(err);
  });
});
