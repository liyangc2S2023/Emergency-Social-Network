//front end document 
$(document).ready(function () {
})

function changePowerStatus() {
  const username = $('#currentUsername').val();
  const newPowerStatus = $('input[name="status"]:checked').val();
  const useraddress = $('#inputAddress').val();
  const description = $('#inputDescription').val();
  console.log('User: ' + username + 'change power status to: ' + newPowerStatus, ' has address: ' + useraddress, ' and description: ' + description);
  // May change depend on whether use roleChangerouter or apiV1 router
  axios.post('/api/v1/powerreport', {
    "username": username,
    "userAddress": useraddress,
    "description": description,
    "powerStatus": newPowerStatus
  }).then(function (res) {
    console.log(res.data.data.powerStatus);
    $('#userPowerStatus').text(newPowerStatus);
  });
}