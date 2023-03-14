var socket = io();

function hideOtherDisplay(componentId) {
  $("#directoryContent").hide()
  $("#publicChatContent").hide()
  $("#searchContent").hide()
  $("#statusContent").hide()
  $("#privateChatContent").hide()
  $("#" + componentId).show()
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

function displayPrivate(receiver) {
    console.log(receiver);
    // clear
    const privateDialog = document.querySelector('#privateDialog');
    privateDialog.innerHTML = '';
    // get receiver
    $('#receiver').val(receiver);

    // get sender by api
    axios.get('api/v1/users/current').then((res) => {
        const { username } = res.data.data;
        const sender = username;

        // get history messages via api
        return axios.get(`api/v1/messages/private/${sender}/${receiver}`);
    }).then((res)=>{
        // unpack message list
        const messageList = res.data.data;
        // render to pug ( in progess )
    })

    // show private chat page
    hideOtherDisplay("privateContent")

    window.scrollTo(0, 0)
    var t = document.body.scrollHeight;
    window.scroll({ top: t, left: 0, behavior: 'smooth' });
}

function displayPrivateMessage(receiver) {
    $('#title').text(`${receiver}`);
    $('title').text(`ESNetwork - Chat to ${receiver}`);
    // clear
    const privateDialog = document.querySelector('#privateDialog');
    privateDialog.innerHTML = '';
    // get receiver
    $('#receiver').val(receiver);

    // get sender by api
    axios.get('api/v1/users/current').then((res) => {
        const { username } = res.data.data;
        const sender = username;

        // get history messages via api
        return axios.get(`api/v1/messages/private/${sender}/${receiver}`);
    }).then((res)=>{
        // unpack message list
        const messageList = res.data.data;
        // render to pug ( in progess )
    })

    // show private chat page
    hideOtherDisplay("privateChatContent")

    window.scrollTo(0, 0)
    var t = document.body.scrollHeight;
    window.scroll({ top: t, left: 0, behavior: 'smooth' });
}

function displayDirectory() {
    $('#title').text("Directory")
    $('title').text("Directory")
    document.querySelector('title').textContent = "ESNetwork - Directory";
    $('#title').text("Directory")
    $('title').text("Directory")
    document.querySelector('title').textContent = "ESNetwork - Directory";
  hideOtherDisplay("directoryContent")
  window.scrollTo(0, 0)
}
