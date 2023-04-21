function editProfile(username){
    $("#editProfileModal").modal("show");

    axios.get(`api/v1/users/${username}`).then((res) => {
        const user = res.data.data;
        $("#profileUsernameInput").val(user.username);
        // previous password is not shown
        $("#profilePasswordInput").val(user.password);
        console.log(user.password);
        $("#privilegeSelect").val(user.role);
        // $("#accountStatusSelect").val(?);
    });
}

function clearEditForm(){
    $("#profileUsernameInput").val("");
    $("#profilePasswordInput").val("");
    $("#privilegeSelect").val("");
    // $("#accountStatusSelect").val(?);
}

function submitEditFile(){
    // Your code here

    $("#editProfileModal").modal("hide");
    clearEditForm();
}
