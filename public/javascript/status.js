//front end document 
$(document).ready(function () {
})

function changeStatus() {
  const username = $('#username').val();
  const newStatus = $('input[name="status"]:checked').val();
  console.log('change status to: ' + newStatus, ' for user: ' + username)
  let updatedStatus;
  axios.post('/api/v1/status', {
    "username": username,
    "status": newStatus
  }).then(function (res) {
    console.log(res);
    updatedStatus = res.data.data.status;
    console.log(updatedStatus);
    $('#userStatus').text(updatedStatus);
  });
}
