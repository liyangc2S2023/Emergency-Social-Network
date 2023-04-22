var clickedUsername;

function editProfile(username){
    $("#editProfileModal").modal("show");
    clickedUsername=username
    axios.get(`api/v1/users/${username}`).then((res) => {
        const user = res.data.data;
        $("#profileUsernameInput").val(user.username);
        // previous password is not shown
        $("#profilePasswordInput").val("");
        $("#privilegeSelect").val(user.role);
        $("#accountStatusSelect").val(user.active.toString());
    });
}

function submitEditFile(){
    // Your code here
    var userid = clickedUsername
    var username = $("#profileUsernameInput").val();
    var password = $("#profilePasswordInput").val();
    var role = $("#privilegeSelect").val();
    var active = $("#accountStatusSelect").val()==="true"?true:false;

    axios.put(`api/v1/users/${userid}`, {
        username: username,
        password: password,
        role: role,
        active: active
    }).then((res) => {
        if(res.data.success){
            $("#editProfileModal").modal("hide");
            if(getCurrentUsername()==userid && role!=='admin'){
                window.location.reload();
            }
        }
        else{
            alert(res.data.message);
        }
    }).catch((err) => {
        console.log(err);
    });

}
