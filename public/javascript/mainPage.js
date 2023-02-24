function displayPublic(){
    $("#directoryContent").hide()
    $("#publicContent").show()
    window.scrollTo(0,0)
    var t = document.body.scrollHeight;
    window.scroll({ top: t, left: 0, behavior: 'smooth' });
}

function displayDirectory(){
    $("#directoryContent").show()
    $("#publicContent").hide()
    window.scrollTo(0,0)
}