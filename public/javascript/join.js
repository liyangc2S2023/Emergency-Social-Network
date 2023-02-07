window.onload=function(){
    const form = document.getElementById("registration-form");
    form.addEventListener("submit", (event) => {
        event.preventDefault();
    });
}

function confirmClicked(){
    console.log('confirmClicked')
    var isValid=true;
    const form = $("#registration-form");
    const username = $("#username").val();
    const password = $("#password").val();
    if(password.length<4){
        isValid=false
        $("#password").addClass("invalid");
        $("#error-message-4").show()
    }
    if(username.length<3){
        isValid=false
        $("#username").addClass("invalid");
        $("#error-message-3").show()
    }
    // // todo: banned name    
    // let bannedName = false
    // if(bannedName && bannedName.indexOf(username)!=-1){
    //     $("#username").addClass("invalid");
    //     $("#error-message-2").show()
    //     isValid=false
    // }
    // todo: username exists
    // if(usernameExist){
    //     isValid=false
    //     $("#username").addClass("invalid");
    //     $("#error-message-1").show()
    // }

    // todo: fix problem
    if(isValid){
        // form.submit()
        axios.post('/join',{
            username:username,
            password:password
        }).then(function(res){
            location.href='/rules'
        }).catch(function(err){
            console.log(err)
        })
    }
}

function nextBtnClicked(){
    $('.ui.basic.modal').modal('show')
}
