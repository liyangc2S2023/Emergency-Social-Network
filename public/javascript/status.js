//front end document 
$(document).ready(function () {
})

function changeStatus() {
  const username = $('#username').val();
  var newStatus = $('input[name="status"]').val();
  console.log('change status to: ' + newStatus, ' for user: ' + username)
  axios.post('/api/v1/status', {
    "username": username,
    "status": newStatus
  }).then(function (res) {
    console.log(res);
    updatedStatus = res.data.data.status;
    $('#status').val(updatedStatus);
  });
}
