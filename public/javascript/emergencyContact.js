function clickAddEmergencyContactButton() {
  const params = {
    username: $('#currentUsername').val(),
    usernameOther: $('#emergencyNameSerach').val(),
  };
  console.log("sending:", params)
  axios.post('/emergencyContact', params).then((res) => {
    const contactsHTML = res.data.data.contactsHTML;
    console.log("received:", contactsHTML)
    $('#emergencyContactList').html(contactsHTML);
  });
}

function clickDeleteEmergencyContactButton(name) {
  const params = {
    username: $('#currentUsername').val(),
    usernameOther: name,
  };
  console.log("sending deleting:", params)
  axios.delete('/emergencyContact', { params }).then((res) => {
    const contactsHTML = res.data.data.contactsHTML;
    console.log("received:", contactsHTML)
    $('#emergencyContactList').html(contactsHTML);
  });
}