var socket = io();

function getCurrentUsername() {
  return $("#currentUsername").val()
}
function getCurrentStatus() {
  return $("#currentUserStatus").val()
}

function getCurrentRole() {
  return $("#currentUserRole").val();
}

function getCurrentPowerStatus() {
  return $("#currentUserPowerStatus").val()
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
  $("#roleContent").hide();
  $("#powerContent").hide();
  $("#privateChatContent").hide();
  $("#searchContent").hide();
  $("#blogContent").hide();
  $("#editBlogContent").hide();
  $("#viewBlogContent").hide();
  $("#discoverContent").hide();
  $("#supplyContent").hide();
  $("#exchangeContent").hide();
  $("#mapContent").hide();
  $("#powerIssueContent").hide();
  $("#" + componentId).show()
  if (componentId === "privateChatContent") {
    $("#main-page-back").show();
  } else {
    $("#main-page-back").hide();
  }
  if (componentId === "statusContent" | componentId === "discoverContent" | componentId === "supplyContent" | componentId === "exchangeContent") {
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
// this function handles UI changes when user role changes
updateUserRoleUI = (username, role) => {
  // update the hidden UI on page
  if ($("#currentUsername").val() == username) {
    $("#currentUserRole").val(role);
  }
}

// this function handles UI changes when user power status changes
updateUserPowerReportUI = (username, description, address, powerStatus) => {
  // update the hidden UI on page
  if ($("#currentUsername").val() == username) {
    $("#currentUserPowerStatus").val(powerStatus);
    $("#currentUserDescription").val(description);
    $("#currentUseAddress").val(address);
  }
  const userStatus = $('#powerStatus').val();
}

// updatePowerIssueList = ()

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
  }).appendTo(parent[0])
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

displayPowerIssue = () => {
  changeTitle("Power Issue List");
  setCurrentPage("powerIssueContent");
  hideOtherDisplay("powerIssueContent")
  setActiveItem('powerIssueMenu');
  // // use socket to add latest fix order, client(fixOrder,js) -> server(apiV1Routes.js)
  socket.on('userPowerReport', (updateContent) => {
    console.log("socket enter" + updateContent);
    $('#fixOrderItems').append(updateContent);
  });
}

displayRole = () => {
  changeTitle("Role");
  setCurrentPage("roleContent");
  hideOtherDisplay("roleContent")
  setActiveItem('roleMenu');
}

displayPower = () => {
  changeTitle("Power");
  setCurrentPage("powerContent");
  hideOtherDisplay("powerContent")
  setActiveItem('powerMenu');
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

displaySupply = () => {
  changeTitle("Supply");
  setCurrentPage("supplyContent");
  hideOtherDisplay("supplyContent")
  setActiveItem('discoverMenu');
}

function displayExchange() {
  changeTitle("Exchange");
  setCurrentPage("exchangeContent");
  hideOtherDisplay("exchangeContent")
  setActiveItem('discoverMenu');
}

function initialPowerPage() {
  console.log("enter initialPowerPage");
  const username = $("#currentUsername").val();
  axios.get('/api/v1/initialrole', { username }).then(res => {
    const results = res.data.data.role;
    $("#currentUserRole").val(results);
    const role = $("#currentUserRole").val();
    if (role === 'user') {
      displayPower();
    } else if (role === 'electrician') {
      displayPowerIssue();
    }
  });
}

function initialSearchPage() {
  // set default page number to be 0.
  $('#pageNumber').val(0);
  $('#hasResult').val(false);
  $('#pageMenu').hide();
}

function displaySearch() {
  // fetch current page, for example, if I am in directory, current page = directory
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

function displayBlogboard() {
  changeTitle("Blog");
  setCurrentPage("blogContent");
  hideOtherDisplay("blogContent");
  $("#searchButton").hide();
}

function displayEditBlogPage() {
  hideOtherDisplay("editBlogContent");
  setCurrentPage("editBlogContent");
  $("#main-page-back").show();
  $("#searchButton").hide();
}

function displayViewBlogPage() {
  hideOtherDisplay("viewBlogContent");
  setCurrentPage("viewBlogContent");
  $("#main-page-back").show();
  $("#searchButton").hide();
}

function goBack() {
  if ($('#currentPage').val() === 'privateChatContent') {
    displayDirectory();
  }
  if ($('#currentPage').val() === 'blogContent' || $('#currentPage').val() === 'editBlogContent' || $('#currentPage').val() === 'viewBlogContent') {
    displayBlogboard();
  }
  $("#main-page-back").hide();
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

socket.on('roleChange', (data) => {
  updateUserRoleUI(data.username, data.role);
});

socket.on('userPowerReport', (data) => {
  updateUserPowerReportUI(data.username, data.description, data.address, data.powerStatus);
});

// socket.on('powerIssueList', (data) => {
//   updatePowerIssueList(data.sender, data.helper, data.description, data.address, data.powerStatus);
// });

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

socket.on('logout', (id) => {
  if (id === getCurrentUsername()) {
    window.location.href = '/logout';
  }
});

$(document).ready(() => {
  setCurrentPage("directoryContent");
  setEmergencyContactSearch()
});
