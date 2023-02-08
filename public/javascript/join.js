window.onload=function(){
    const form = document.getElementById("registration-form");
    form.addEventListener("submit", (event) => {
        event.preventDefault();
    });
    
    $('.ui.basic.modal').modal('show')

}

function confirmClicked(){
    const username = $("#username").val();
    const password = $("#password").val();
    const form = $("#registration-form");
    form.attr('action','/join/confirm')
    form.submit()
}

function nextBtnClicked(){
    const form = $("#registration-form");
    form.submit()
}
