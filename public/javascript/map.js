let map;
let chosenMarker;
let chosenInfoWindow;
let currentMarker;
let allMarkers = [];

window.initMap = initMap;

$(document).ready(function(){
  $('.ui.radio.checkbox').checkbox({
    onChecked: function() {
      $('#otherRadioInput').hide();
    },
  })
  $("#otherRadio").attr("onclick","$('#otherRadioInput').show();$('#otherRadioInput').focus();")
});

async function initMapObj(pos){
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: pos,
  });
  map.addListener("click", (mapsMouseEvent)=>{
    unsetChosenRequester()
    hideMapBottom()
  });
  await setupEmergencyControlButton();
}

async function initMap() {
  const {status,record }= (await axios.get('/map/initStatus')).data
  console.log(status)
  getCurrentPosition((pos)=>{
    initMapObj(pos)
    .then(async ()=>{
      setInterval(() => {
        updateCurrentMarker()
      }, 5000); 
      if(status ==='none'){
          await initNone()
      }
      else if(status ==='requesting'){
        // todo: need fix
        setTimeout(() => {
          $("#EmergencyHelpButton").hide();
        }, 1000);
        await getAllOffer(record)
        await initRequesting(record)
      }
      else if(status ==='offering'){
        // todo: need fix
        setTimeout(() => {
          $("#EmergencyHelpButton").hide();
        }, 1000);
        await getAllOtherOffer(record)
        await initOffering(record)
      }
    })
  })
}

async function initNone(){
  var allRequests = (await axios.get('/api/v1/emergencyRequests')).data.data
  allRequests.forEach((request)=>{
    setRequest(request.location,request.formResult,request._id)
  })
  updateCurrentMarker()
}

async function initRequesting(record){
  $("#EmergencyHelpDetail").show();
  currentMarker = setRequest(record.location,record.formResult,record._id)
  $("#EmergencyHelpButton").hide();
}

async function getAllOffer(record){
  axios.get('/api/v1/emergencyResponses/target/'+record._id).then((res)=>{
    res.data.data.forEach((response)=>{
      setResponse(response.location,response._id)
    })
  })
}

async function initOffering(record){
  $("#offerHelpDetail").show();
  updateCurrentMarker(record._id,record.target);
  $("#EmergencyHelpButton").hide();
  axios.get('/api/v1/emergencyRequests/'+record.target).then((res)=>{
    setRequest(res.data.data.location,res.data.data.formResult,res.data.data._id)
  })
}

async function getAllOtherOffer(record){
  axios.get('/api/v1/emergencyResponses/target/'+record.target).then((res)=>{
    res.data.data.forEach((response)=>{
      if(response._id !== record._id){
        setResponse(response.location,response._id)
      }
    })
  })
}

// logic with backend
// emergency help ui control
function onMapFormConfirmClick(){
  var a1 = $("input[name='q1']:checked").val();
  if(a1==="other") a1 = $("#otherRadioInput").val();
  var a2 = $("input[name='q2']:checked").val();
  var a3 = $("input[name='q3']:checked").val();
  var a4 = $("input[name='q4']:checked").val();
  var formResult = "Danger:"+a1+"<br> Can move: "+a2+
                   "<br>Hurt: "+a3+"<br> Bleeding: "+a4;
  getCurrentPosition((pos)=>{
    axios.post('/api/v1/emergencyRequests', {
      formResult: formResult,
      location: pos,
    }).then((res)=>{
      hideMapBottom()
      clearAllMarkers();
      initRequesting(res.data.data)
      // todo: add listen to socket event
    })
  })
}

function helpRecived(){
  axios.put('/api/v1/emergencyRequests/'+currentMarker.id+"/done")
  .then((res)=>{
    $("#EmergencyHelpButton").show();
    $("#EmergencyHelpDetail").hide();
    clearAllMarkers();
    // todo: stop listen to socket event
  })
  .then(async ()=>{
    await initNone();
  })
}

function helpCancel(){
  axios.delete('/api/v1/emergencyRequests/'+currentMarker.id).then((res)=>{
    $("#EmergencyHelpButton").show();
    $("#EmergencyHelpDetail").hide();
    clearAllMarkers();
    // todo: stop listen to socket event
  }).then(async ()=>{
    await initNone();
  })
}

// offer help ui control
function onOfferHelpClick(){
  axios.post('/api/v1/emergencyResponses', {
    location: currentMarker.position,
    target: chosenMarker.id,
  }).then((res)=>{
    hideMapBottom()
    clearAllMarkers();
    initOffering(res.data.data)
    getAllOtherOffer(res.data.data)
    // todo: add listen to socket event
  })
}

function offerCancel(){
  axios.delete('/api/v1/emergencyResponses/'+currentMarker.id).then((res)=>{
    $("#EmergencyHelpButton").show();
    $("#offerHelpDetail").hide();
    clearAllMarkers();
    // todo: stop listen to socket event
  }).then(async ()=>{
    await initNone();
  })
}

// UI util functions
async function setupEmergencyControlButton(){
  const locationButton = document.createElement("button");
  locationButton.setAttribute('id', 'EmergencyHelpButton')
  locationButton.setAttribute('class', 'ui red button')
  locationButton.textContent = "Emergency Help";
  locationButton.classList.add("custom-map-control-button");
  await map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
  locationButton.addEventListener("click", () => {
      onEmergencyHelpClick()
      map.setCenter(currentMarker.position);
  });
}

async function getCurrentPosition(callback){
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        callback(pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        console.log(err.toString())
      }
    );
  } else {
    console.log("current browser not support get location")
  }
}

function updateCurrentMarker(id="",target=""){
  getCurrentPosition((pos)=>{
    console.log(pos)
    if(currentMarker){
      currentMarker.setPosition(pos);
      if(currentMarker.id){
        axios.put('/api/v1/emergencyRequests/'+currentMarker.id, {
          location: pos,
        })
      }
    }
    else{
      currentMarker = new google.maps.Marker({
        position: pos,
        map:map,
        icon: getCurrentLocationImage(),
      });
      allMarkers.push(currentMarker);
      currentMarker.id = id;
      currentMarker.target = target;
    }
  })
}

function setRequest(position,formResult,id=""){
  const infowindow = new google.maps.InfoWindow({
    content: formResult,
    ariaLabel: "Emergency Detail",
  });

  var marker = new google.maps.Marker({
    position: position,
    map:map,
    icon: getUnchosenImage(),
  });
  marker.id=id;
  marker.setAnimation(google.maps.Animation.BOUNCE);
  marker.addListener("click", ()=>{
    setChosen(marker);
    infowindow.open({map,anchor: marker});
  });
  allMarkers.push(marker);
  return marker;
}

function setResponse(position,id=""){
  var marker = new google.maps.Marker({
    position: position,
    map:map,
    icon: getResponseImage(),
  });
  marker.id=id;
  allMarkers.push(marker);
  return marker;
}

function clearAllMarkers(){
  allMarkers.forEach((marker)=>{
    marker.setMap(null);
  })
  allMarkers = [];
  currentMarker=null;
  chosenMarker=null;
}

function setChosen(marker){
  unsetChosenRequester()
  chosenMarker = marker;
  marker.setIcon(getChosenImage())
  map.setCenter(marker.position);
  marker.setAnimation(null);
  displayOfferHelp();
}

function unsetChosenRequester(){
  if(chosenMarker){
    chosenMarker.setIcon(getUnchosenImage())
    chosenMarker.setAnimation(google.maps.Animation.BOUNCE);
    chosenMarker = null;
  }
}

// util function
getUnchosenImage =()=> {
  return {
    url: "./image/LocationRequester.png",
    scaledSize: new google.maps.Size(20, 20),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(10, 10),
  }
};
getChosenImage = () => {
  return {
    url: "./image/LocationRequesterChosen.png",
    scaledSize: new google.maps.Size(20, 20),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(10, 10),
  }
};
getCurrentLocationImage=()=>{  
  return {
    url: "./image/LocationCurrent.png",
    scaledSize: new google.maps.Size(40, 40),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(20, 20),
  }
};
getResponseImage=()=>{
  return {
    url: "./image/LocationResponse.png",
    scaledSize: new google.maps.Size(80, 80),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(40, 40),
  }
};

function hideMapBottom(){
  $("#mapBottomInfo").hide();
  $("#mapOfferHelpBottom").hide();
}

function displayOfferHelp(){
  hideMapBottom();
  $("#mapOfferHelpBottom").show();
}
function displayEmergencyHelpBottom(){
  hideMapBottom();
}
function onEmergencyHelpClick(){
  hideMapBottom();
  $("#mapBottomInfo").show();
}

// socket event
socket.on('updateLocation', (id,location)=>{
  allMarkers.forEach((marker)=>{
    if(marker.id==id){
      marker.setPosition(location);
      return;
    }
  })
})

socket.on('stopLocationShare', (id)=>{
  for(var i=0;i<allMarkers.length;i++){
    if(allMarkers[i].id==id){
      if(currentMarker.target === id){
        $("#EmergencyHelpButton").show();
        $("#offerHelpDetail").hide();
        clearAllMarkers();
        initNone();
        return;
      }
      else{
        allMarkers[i].setMap(null);
        allMarkers.splice(i,1);
        return;
      }
    }
  }
})

socket.on('startLocationShare', (id,location,type,formResult)=>{
  console.log("start location share")
  console.log(formResult)
  if(type==="request"){
    setRequest(location,formResult,id);
  }
  else if(type==="respond"){
    setResponse(location,id);
  }
})

