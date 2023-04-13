//front end document 
$(document).ready(function () {
})

function changeToStatus(username, newStatus) {
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

function changeStatus() {
  const username = $('#currentUsername').val();
  const newStatus = $('input[name="status"]:checked').val();
  // get the value of the check box
  const emergencyCheck = document.getElementById('emergencyCheck');

  console.log('emergencyCheck: ' + emergencyCheck.checked)

  if (newStatus === 'emergency' && emergencyCheck.checked) {
    //check if user has emergency contact set
    axios.get('/api/v1/emergencyContacts').then(function (res) {
      const contacts = res.data.data;
      if (contacts.length === 0) {
        alert('You have not set any emergency contact yet. Please set one before you set your status to emergency.');
        return;
      } else {
        const emergencyContactMessage = $('#emergencyContactMessage');

        const contactNames = contacts.map(contact => contact.contact);
        console.log(contactNames);

        emergencyContactMessage.text('You\' notify your emergency contact: ' + contactNames.join(', '));

        //show the hidden component
        $('.notifyEmergencyContacts').show();

        //hide the button
        $('#changeStatusButton').hide()
        //hide all the radio button
        $('.statusChoice').hide();
        $('.emergencyContactFrame').hide();
      }
    });
    return;
  }

  changeToStatus(username, newStatus);
}

function resetStatusPage() {
  // hide notifyEmergencyContacts
  $('.notifyEmergencyContacts').hide();
  //uncheck the check box
  $('#emergencyCheck').prop('checked', false);
  //enable the button
  $('#changeStatusButton').show();
  $('.statusChoice').show();
  $('.statusSelection').prop('checked', false);
  $('.emergencyContactFrame').show();
}

function notifyEmergencyContacts() {

  //change status to emergency
  const username = $('#currentUsername').val();
  changeToStatus(username, 'emergency');

  resetStatusPage();
}
