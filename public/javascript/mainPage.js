var socket = io();

function getCurrentUsername() {
  return $("#currentUsername").val()
}
function getCurrentStatus() {
  return $("#currentUserStatus").val()
}
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
  if (componentId === "privateChatContent") {
    $("#main-page-back").show();
  } else {
    $("#main-page-back").hide();
    $('#chatPrivateReceiver').val('');
  }
}

// run to chang title of net and header
function changTitle(title) {
  $('#title').text(`${title}`);
  $('title').text(`ESNetwork - ${title}`);
}

function setActiveItem(itemId) {
  const menu = document.getElementById('menu');
  const items = menu.querySelectorAll('.menuItem');

  items.forEach((item) => {
    item.classList.remove('active');
  });

  const clickedItem = document.getElementById(itemId);
  clickedItem.classList.add('active');
}

updateUserStatusUI = (username, status) => {
  // this function handles UI changes when user status changes

  // update the hidden UI on page
  if ($("#currentUsername").val() == username) {
    $("#currentUserStatus").val(status)
  }

  // update user status in directory
  const classList = statusMap[status];
  const userStatus = document.querySelector(`#directoryStatus-${username}`);
  if (userStatus) {
    userStatus.classList = classList;
  }
}

appendPrivateMessage = (msg) => {
  // TODO: render sender avatar
  $('#privateDialog').append(msg);
}

alertPrivateMessage = (sender) => {
  $('#directoryNewMessage-' + sender).attr('style', 'display: inline-block');
}

handleUserStateChange = (username, state) => {
  // this function handles UI changes when user state changes
  // eg. login or logout
  const userElement = $('#directory-user-block-' + username);
  if (state === 'login') {
    const metaElement = userElement.find('.meta');
    metaElement.text('online');
    metaElement.addClass('online');
  } else {
    const metaElement = userElement.find('.meta');
    metaElement.text('offline');
    metaElement.removeClass('online');
  }
}

function displayPublic() {
  changTitle("Chat Public");
  // document.querySelector('headerTitle').textContent = "Public Chat";
  hideOtherDisplay("publicChatContent")
  window.scrollTo(0, 0)
  var t = document.body.scrollHeight;
  window.scroll({ top: t, left: 0, behavior: 'smooth' });
  setActiveItem('publicMenu');
}


function displayPrivateMessage(receiver) {
  changTitle(`${receiver}`);

  // clear current page
  const privateDialog = document.querySelector('#privateDialog');
  privateDialog.innerHTML = '';
  $('#directoryNewMessage-' + receiver).hide();

  // save receiver for future message
  $('#chatPrivateReceiver').val(receiver);
  const sender = $('#currentUsername').val();

  axios.get(`chat/messages/private/${sender}/${receiver}`).then((res) => {
    $('#privateDialog').html(res.data);
  });
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
  setActiveItem('directoryMenu');
}

displayStatus = () => {
  changTitle("Status");
  hideOtherDisplay("statusContent")
  setActiveItem('statusMenu');
}

socket.on('statusChange', (data) => {
  updateUserStatusUI(data.username, data.status);
});

socket.on('newPrivateMessage', (messageHTML, sender) => {
  if (getCurrentUsername() !== sender) {
    alertPrivateMessage(sender);
  }
  appendPrivateMessage(messageHTML, sender);
  var t = document.body.scrollHeight;
  window.scroll({ top: t, left: 0, behavior: 'smooth' });
});

socket.on('userLogin', (username) => {
  handleUserStateChange(username, 'login');
});

socket.on('userLogout', (username) => {
  handleUserStateChange(username, 'offline');
});
