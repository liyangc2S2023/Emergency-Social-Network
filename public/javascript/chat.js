// socket
socket.on('newMessage', (newMessage) => {
  //scroll to the latest post
  $("#dialog").append(newMessage)
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
      receiver: 'all',
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

function privateSend() {
  // get information from local storage
  const inputContent = $('#privateInputContent').val();
  const sender = $('#username').val();
  const status = $('#status').val();
  const receiver = $('#receiver').val();
  // check if the input is null
  if (inputContent == '' || sender == '' || status == '') {
    alert(`input text:${inputContent} or username:${sender} or user status:${status} cannot be null`);
  } else {
    // pack the information
    const message = {
      sender: sender,
      receiver: receiver,
      status,
      content: inputContent,
    };
    // store message to database
    axios.post('/api/v1/messages', message).then((res) => {
      $('#privateInputContent').val('');
    });
  }
}

$(document).ready(() => {
  axios.get('api/v1/users/current').then((res) => {
    const { username } = res.data.data;
    const { status } = res.data.data;
    $('#username').val(username);
    $('#status').val(status);
  }).catch((err) => {
    alert(err);
  });
});
