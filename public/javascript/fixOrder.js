// use socket to add latest fix order, client(fixOrder,js) -> server(apiV1Routes.js)
socket.on('userPowerReport', (updateContent) => {
  $('#fixOrderItems').append(updateContent);
});

socket.on('electricianFix', (updateContent) => {
  $('#fixOrderItems').append(updateContent);
});

$(document).ready(() => {
  axios.get('/api/v1/powerIssueList').then(res => {
    const powerStatus = res.data.data.powerStatus;
    var results = '';
    if(powerStatus){
      results = powerStatus.status;
    }
    $('#fixOrderItems').append(results);
  });
});


// update the status of the power issue order and send the data to the backend
function updateFixOrderStatus(sender, newStatus) {
  const helper = $("#currentUsername").val();
  if(newStatus === 'needFix'){
    $('#data-text').val('Go Fix');
    $('#data-text').text("Go Fix");
    newStatus = 'fixing';
    } else if(newStatus === 'fixing'){
      $('#data-text').val('Done');
      $('#data-text').text("Done");
      newStatus = 'normal';
    }
  let buttonText = $('#data-text').val();
  if (buttonText === 'Go Fix') {
    axios.post('/api/v1/fixorder', {
      "sender": sender,
      "helper": helper,
      "status": newStatus,
    }).then(function (res) {
      let updatedStatus = res.data.data.powerStatus;
      $('#powerStatus').val(newStatus);
      $('#powerStatus').text("powerStatus: " + newStatus);
      $('#showHelper').val(helper);
      $('#showHelper').text("Helper: " + helper + " is fixing...");
    });
  } else if (buttonText === 'Done') {
    axios.post('/api/v1/fixorder', {
      "sender": sender,
      "helper": helper,
      "status": newStatus,
    }).then(function (res) {
      let updatedStatus = res.data.data.powerStatus;
      $('#powerStatus').val(newStatus);
      $('#powerStatus').text("powerStatus: " + newStatus);
      $('#showHelper').val(helper);
      $('#showHelper').text("Helper: " + helper + " done fix");
      const itemToRemove = document.querySelector(`.active#directory-power-block-${unfixedOrder.sender}`);
      itemToRemove.parentNode.removeChild(itemToRemove);
    });
  }
}
