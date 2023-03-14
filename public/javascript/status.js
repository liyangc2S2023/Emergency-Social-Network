//front end document 
$(document).ready(function () {
    axios.get('api/v1/users/current').then(function (res) {
        //current newly change 
        var username = res.data.data.username
        console.log(username)
        var status = res.data.data.status
        console.log(status)
        //store username & status in localstorage 
        $('#username').val(username)
        $('#status').val(status)
    }).then(function () {
        // Update the current status on the page 
        $('h2.h').text($('#status').val());
    }).catch(function (err) {
        alert(err)
    })
    var username = $('#username').val()
    var status = $('#status').val()
    // Handle form submission 
    $('form').on('submit', function (e) {
        e.preventDefault();
        var newStatus = $('input[name="status"]').val();
        $('#status').val(newStatus)
        var status_ = {
            "username": username,
            "status": status
        }
        console.log(1);
        axios.post('api/v1/status', status_).then(function (res) {
            $('h2.h').text($('#status').val());
            //socket.emit('statusUpdate',status_) 
        });
    });
})

function changeClick() {
    //current newly change 
    var username = res.data.data.username
    var status = res.data.data.status
    //store username & status in localstorage 
    $('#username').val(username)
    $('#status').val(status)
    // Handle form submission 
    $('form').on('submit', function (e) {
        e.preventDefault();
        var newStatus = $('input[name="status"]').val();
        $('#status').val(newStatus)
        axios.post('/api/v1/status', {
            "username": username,
            "status": status
        }).then(function (res) {
            $('h2.currentStatus').text($('#status').val());
            //socket.emit('statusUpdate',status_) 
        });
    });
}  