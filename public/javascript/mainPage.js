var socket = io();

function getCurrentUsername() {
  return $("#currentUsername").val()
}
function getCurrentStatus() {
  return $("#currentUserStatus").val()
}
const statusMap = {
  undefined: 'circle outline purple icon',
  ok: 'circle green icon ',
  help: 'circle yellow icon',
  emergency: 'circle red icon',
};

function hideOtherDisplay(componentId) {
  $("#directoryContent").hide();
  $("#publicChatContent").hide();
  $("#searchContent").hide();
  $("#statusContent").hide();
  $("#privateChatContent").hide();
  $("#" + componentId).show()
  $("#currentPage").val(componentId);
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
  //TODO: remove console log after feature complete
  console.log('received new message from ' + sender)
  $('#directoryNewMessage-' + sender).attr('style', 'display: inline-block');
}

directoryGetisOnline= (a)=>{
  return $(a).find('.online').length>0
}

reorderDirectory = ()=>{
  var elements = $("div[id^=directory-user-block-]")
  var parent = elements.parent()
  elements.detach().sort(function(a,b){
    var isAOnline = directoryGetisOnline(a)
    var isBOnline = directoryGetisOnline(b)
    return isAOnline == isBOnline ? a.id.localeCompare(b.id) : isBOnline - isAOnline;
  }).appendTo(parent)
}

handleUserStateChange =async (username, state) => {
  // this function handles UI changes when user state changes
  // eg. login or logout
  const userElement = $('#directory-user-block-' + username);
  if (state === 'login') {
    const metaElement = userElement.find('.meta');
    metaElement.text('online');
    metaElement.addClass('online');
    reorderDirectory()
  } else {
    const metaElement = userElement.find('.meta');
    metaElement.text('offline');
    metaElement.removeClass('online');
    reorderDirectory()
  }
}

function displayPublic() {
  changTitle("Chat Public");
  // document.querySelector('headerTitle').textContent = "Public Chat";
  hideOtherDisplay("publicChatContent")
  window.scrollTo(0, 0)
  var t = document.body.scrollHeight;
  scrollDown("publicChatContent");
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
    scrollDown("privateChatContent");
  });

  // show private chat page
  hideOtherDisplay("privateChatContent")
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

function displaySearch() {
  changTitle("Search");
  hideOtherDisplay("searchContent")
  window.scrollTo(0, 0)
  scrollDown("searchContent");
}

socket.on('statusChange', (data) => {
  updateUserStatusUI(data.username, data.status);
});

socket.on('newPrivateMessage', (messageHTML, sender) => {
  if (getCurrentUsername() !== sender) {
    alertPrivateMessage(sender);
  }
  appendPrivateMessage(messageHTML, sender);
  const username = $('#currentUsername').val();
  $(`.avatar-${sender}`).attr("src", sender == username ? avatar.sender : avatar.receiver)
  scrollDown('privateChatContent');
});

socket.on('userLogin', (username) => {
  handleUserStateChange(username, 'login');
});

socket.on('userLogout', (username) => {
  handleUserStateChange(username, 'offline');
});

socket.on('updateAlert', (unreadUserSet) => {
  unreadUserSet.forEach((user) => {
    alertPrivateMessage(user);
  });
});
