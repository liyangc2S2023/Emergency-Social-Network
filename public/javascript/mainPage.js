var socket = io();

function hideOtherDisplay(componentId) {
  $("#directoryContent").hide()
  $("#publicChatContent").hide()
  $("#searchContent").hide()
  $("#statusContent").hide()
  $("#privateChatContent").hide()
  $("#" + componentId).show()
}

// run to chang title of net and header
function changTitle(title){
    $('#title').text(`${title}`);
    $('title').text(`ESNetwork - ${title}`);
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


function displayDirectory(){
    changTitle("Directory");
    hideOtherDisplay("directoryContent")
    window.scrollTo(0,0)
}

displayStatus = () => {
  hideOtherDisplay("statusContent")
}
