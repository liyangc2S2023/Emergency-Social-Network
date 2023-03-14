var socket = io();

const statusMap = {
  undefined: 'circle outline grey icon',
  ok: 'circle green icon ',
  help: 'circle yellow icon',
  emergency: 'circle red icon',
};

function hideOtherDisplay(componentId) {
  $("#directoryContent").hide()
  $("#publicChatContent").hide()
  $("#searchContent").hide()
  $("#statusContent").hide()
  $("#privateChatContent").hide()
  $("#" + componentId).show()
}

// run to chang title of net and header
function changTitle(title) {
  $('#title').text(`${title}`);
  $('title').text(`ESNetwork - ${title}`);
}

updateUserStatusUI = (username, status) => {
  // this function handles UI changes when user status changes

  // update the hidden UI on page


  // update user status in directory
  const classList = statusMap[status];
  const userStatus = document.querySelector(`#directoryStatus-${username}`);
  if (userStatus) {
    userStatus.classList = classList;
  }
}

function displayPublic() {
  $('#title').text("Chat Public")
  $('title').text("ESNetwork - Chat Public")
  // document.querySelector('headerTitle').textContent = "Public Chat";
  hideOtherDisplay("publicChatContent")
  window.scrollTo(0, 0)
  var t = document.body.scrollHeight;
  window.scroll({ top: t, left: 0, behavior: 'smooth' });
}


function displayPrivateMessage(receiver) {
  changTitle(`${receiver}`);

  // clear current page
  const privateDialog = document.querySelector('#privateDialog');
  privateDialog.innerHTML = '';

  // get receiver
  $('#receiver').val(receiver);
  //const sender = $('#username').val();

  // to-do get history message
  // axios.get(`api/v1/messages/private/${sender}/${receiver}`)

  // show private chat page
  hideOtherDisplay("privateChatContent")

  window.scrollTo(0, 0)
  var t = document.body.scrollHeight;
  window.scroll({ top: t, left: 0, behavior: 'smooth' });
}


function displayDirectory() {
  changTitle("Directory");
  hideOtherDisplay("directoryContent")
  window.scrollTo(0, 0)
}

displayStatus = () => {
  hideOtherDisplay("statusContent")
}

displayStatus = () => {
  hideOtherDisplay("statusContent")
}

function clickSpeedTest(){
    console.log("clicked")
    $('.ui.modal').modal('show')
}

function startSpeedTest(){
    //todo: send post
    axios.post('/')
}

$(document).ready(() => {
    $(".ui.icon").popup();
})
socket.on('statusChange', (data) => {
  updateUserStatusUI(data.username, data.status)
});