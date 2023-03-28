// click to hide the announcement box
function hideAnnouncement() {
    $("#announcementContainer").fadeOut("slow");
}

function sendAnnouncement() {
    const username = $('#currentUsername').val();
    const inputContent = $('#announcementInputContent').val();
    if (!(inputContent && username)) {
        alert(`input text:${inputContent} or username:${username} cannot be null`);
    } else {
        const announcement = {
            sender: username,
            timestamp: new Date(),
            content: inputContent,
        };
        axios.post(`/api/v1/announcements`, announcement).then((res) => {
            $('#announcementInputContent').val('');
        });
    }
}

// socket
socket.on('newAnnouncement', (newAncm) => {
    //scroll to the latest post
    $("#announcementDialog").append(newAncm)
    $("#announcementContainer").show();
    scrollDown('announcementContent');
    setTimeout(function(){
        $("#announcementContainer").fadeOut("slow");;
    }, 5000);
  });
