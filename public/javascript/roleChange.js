//front end document 
$(document).ready(function () {
})

function changeRole() {
  const username = $('#currentUsername').val();
  const newRole = $('input[name="role"]:checked').val();
  console.log('change role to: ' + newRole, ' for user: ' + username)
  let updatedRole;
  // May change depend on whether use roleChangerouter or apiV1 router
  axios.post('/api/v1/role', {
    "username": username,
    "role": newRole
  }).then(function (res) {
    $('#userRole').text(newRole);
  });
}