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

function setCurrentPage(componentId) {
  $("#currentPage").val(componentId);
}

function hideOtherDisplay(componentId) {
  $("#directoryContent").hide();
  $("#publicChatContent").hide();
  $("#announcementContent").hide();
  $("#statusContent").hide();
  $("#privateChatContent").hide();
  $("#searchContent").hide();
  $("#discoverContent").hide();
  $("#mapContent").hide();
  $("#" + componentId).show()
  if (componentId === "privateChatContent") {
    $("#main-page-back").show();
  } else {
    $("#main-page-back").hide();
  }
  if (componentId === "statusContent" | componentId === "discoverContent") {
    $("#searchButton").hide();
  } else {
    $("#searchButton").show();
  }
}

// run to change title of net and header
function changeTitle(title) {
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
  $('#directoryNewMessage-' + sender).attr('style', 'display: inline-block');
}

updateGroupChatList = (groupChatListHTML) => {
  $('#groupChatContent').html(groupChatListHTML);
}

directoryGetisOnline = (a) => {
  return $(a).find('.online').length > 0
}


reorderDirectory = () => {
  var elements = $("div[id^=directory-user-block-]")
  var parent = elements.parent()
  elements.detach().sort(function (a, b) {
    var isAOnline = directoryGetisOnline(a)
    var isBOnline = directoryGetisOnline(b)
    return isAOnline == isBOnline ? a.id.localeCompare(b.id) : isBOnline - isAOnline;
  }).appendTo(parent)
}

handleUserStateChange = async (username, state) => {
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
  changeTitle("Chat Public");
  // document.querySelector('headerTitle').textContent = "Public Chat";
  hideOtherDisplay("publicChatContent")
  window.scrollTo(0, 0)
  var t = document.body.scrollHeight;
  setCurrentPage("publicChatContent");
  scrollDown("publicChatContent");
}

function displayPrivateMessage(receiver) {
  changeTitle(`${receiver}`);
  receiver_parts = receiver.split("-");
  $("#closeEmgergencyGroup").hide();

  if (receiver_parts[0] == "group") {
    // this is a group chat
    $("#emergency-group").val(true);
    $("#emergency-group-initiator").val(receiver_parts[1]);

    if (receiver_parts[1] == getCurrentUsername()) {
      $("#closeEmgergencyGroup").show();
    } else {
      $("#closeEmgergencyGroup").hide();
    }
  }

  // clear current page
  const privateDialog = document.querySelector('#privateDialog');
  privateDialog.innerHTML = '';
  $('#directoryNewMessage-' + receiver).hide();

  // save receiver for future message
  $('#chatPrivateReceiver').val(receiver);
  const sender = $('#currentUsername').val();

  if (receiver_parts[0] == "group") {
    // this is a group chat
    axios.get(`chat/messages/group/${receiver}`).then((res) => {
      // console.log(res.data)
      $('#privateDialog').html(res.data);
      scrollDown("privateChatContent");
    });
  } else {
    axios.get(`chat/messages/private/${sender}/${receiver}`).then((res) => {
      $('#privateDialog').html(res.data);
      scrollDown("privateChatContent");
    });
  }

  setCurrentPage("privateChatContent");
  // show private chat page
  hideOtherDisplay("privateChatContent")
}

function closeGroupChat() {
  // const group = $("#emergency-group-initiator").val;
  let groupname = $("#chatPrivateReceiver").val();
  groupname = groupname.split("-").slice(1).join("-");
  console.log(groupname)
  const params = {
    groupname,
  };
  axios.put(`/api/v1/emergencyGroupChat`, params).then((res) => {
    console.log(res.data);
    displayDirectory();
  });
}

function displayAnnouncement() {
  changeTitle("Announce");
  hideOtherDisplay("announcementContent")
  window.scrollTo(0, 0)
  var t = document.body.scrollHeight;
  setCurrentPage("announcementContent");
  scrollDown("announcementContent");
}

function displayDirectory() {
  changeTitle("Directory");
  setCurrentPage("directoryContent");
  hideOtherDisplay("directoryContent")
  window.scrollTo(0, 0)
  setActiveItem('directoryMenu');
}

displayStatus = () => {
  changeTitle("Status");
  setCurrentPage("statusContent");
  hideOtherDisplay("statusContent")
  setActiveItem('statusMenu');
}

displayDiscover = () => {
  changeTitle("Discover");
  setCurrentPage("discoverContent");
  hideOtherDisplay("discoverContent")
  setActiveItem('discoverMenu');
}

function initialSearchPage() {
  // set default page number to be 0.
  $('#pageNumber').val(0);
  $('#hasResult').val(false);
  $('#pageMenu').hide();
}

function displaySearch() {
  const currentPage = $("#currentPage").val();
  const searchOptions = $('.searchInfo');
  $(searchOptions).hide();
  let hasSelected;
  // show the option corresponding to current page
  searchOptions.each((_index, option) => {
    if ($(option).data('page') === currentPage) {
      $(option).show();
      if (!hasSelected) {
        $(option).prop('selected', true);
        hasSelected = true;
      }
    }
  });
  initialSearchPage();
  hideOtherDisplay("searchContent");
  window.scrollTo(0, 0);
  scrollDown("searchContent");
  // clearContent
  const resultsContainer = $('.container.searchResults');
  resultsContainer.empty(); // clear any previous search results
}

const transformUserList = (userList) => {
  return userList.map((user) => {
    return {
      title: user.username,
      value: user.username,
    };
  });
}

function setEmergencyContactSearch() {
  // get userlist through axios
  const emergencyContactSearch = $('#emergencyContactSearch');
  axios.get(`/api/v1/users`,).then((res) => {
    const userList = res.data.data;
    const transformedUserList = transformUserList(userList);
    emergencyContactSearch.search({
      source: transformedUserList,
    })
  });
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

socket.on('groupChatContentUpdate', (groupChatContent) => {
  updateGroupChatList(groupChatContent);
});

socket.on('setToDirectoryPage', () => {
  displayDirectory();
});

$(document).ready(() => {
  setCurrentPage("directoryContent");
  setEmergencyContactSearch()
});
