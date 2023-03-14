var socket = io();

function hideOtherDisplay(componentId) {
  $("#directoryContent").hide()
  $("#publicContent").hide()
  $("#searchContent").hide()
  $("#statusContent").hide()
  $("#" + componentId).show()
}

function displayPublic() {
  hideOtherDisplay("publicContent")
  window.scrollTo(0, 0)
  var t = document.body.scrollHeight;
  window.scroll({ top: t, left: 0, behavior: 'smooth' });
}

function displayDirectory() {
  hideOtherDisplay("directoryContent")
  window.scrollTo(0, 0)
}

displayStatus = () => {
  hideOtherDisplay("statusContent")
}
