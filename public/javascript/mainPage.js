var socket = io();
var progressInterval;

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
    $('.ui.modal').modal('show')
    $("#speedTestLoading").hide()
    $("#speedTestReport").hide()
    $("#speedTestForm").show()
    $("#speedTestActions").show()
    $("#durationInput").val("")
    $("#intervalInput").val("")
    $("#speedTestStopResult").hide()
    $("#speedTestStopping").hide()
    $("#progress").attr("data-percent","0")
    clearInterval(progressInterval)
}

function displayLoading(time){
    $("#speedTestLoading").show()
    $("#progress").progress({percent:0})
    progressInterval = setInterval(()=>{
        var prev = Number($("#progress").attr("data-percent"))
        // $("#progress").attr("data-percent",str(prev+1))
        $("#progress").progress({percent:prev+1})
    },time*10)
}

function stopSpeedTest(){
    axios.delete('/speedTest').then((res)=>{
        $("#speedTestStopping").hide()
        $("#speedTestStopResult").show()
        if(res.status==200){
            $("#speedTestStopResult").text("Stop Succeeded")
        }
        else{
            $("#speedTestStopResult").text("Stop Failed")
            console.error(res)
        }
    })
    $("#speedTestStopping").show()
    $("#speedTestStop").hide()
    $("#speedTestLoading").hide()
    clearInterval(progressInterval)
}

function startSpeedTest(){
    var duration = Number($('#durationInput').val())
    var interval = Number($('#intervalInput').val())
    if(!isNaN(duration) && !isNaN(interval)){
        axios.post('/speedTest',{
            duration,
            interval
        },{timeout:(duration+5)*1000}).then((res)=>{
            // stop loading
            clearInterval(progressInterval)
            $("#speedTestLoading").hide()
            $("#speedTestStop").hide()
            var data = res.data.data
            if(data.exitStatus==0){
                // display message
                $("#speedTestReport").show()
                $("#PostResult").text(data.postPerformance.toFixed(2))
                $("#GetResult").text(data.getPerformance.toFixed(2))
            } else if(data.exitStatus==1){
                $("#speedTestStopResult").show()
                $("#speedTestStopResult").text("POST number exceeds post request limit (POST Request Limit Rule)")
            }
        })
        // loading
        displayLoading(duration)
        $("#speedTestForm").hide()
        $("#speedTestActions").hide()
        $("#speedTestStop").show()
    }
}

$(document).ready(() => {
    $(".ui.icon").popup();
})
socket.on('statusChange', (data) => {
  updateUserStatusUI(data.username, data.status)
});
