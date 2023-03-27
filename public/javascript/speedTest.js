var progressInterval;
var postInterval;
var getInterval;
var postTimeout;
var getTimeout;
var postTime = 0;
var postNum = 0;
var getTime = 0;
var getNum = 0;
var count = 0;

function initPerformance(){
    clearInterval(postInterval)
    clearInterval(getInterval)
    clearTimeout(postTimeout)
    clearTimeout(getTimeout)
    postTime = 0;
    postNum = 0;
    getTime = 0;
    getNum = 0;
    count = 0;
}

function hideAll(action){
    $("#speedTestForm").hide()
    $("#speedTestReport").hide()
    $("#speedTestLoading").hide()
    $("#speedTestStopping").hide()
    $("#speedTestStopResult").hide()
    $("#speedTestActions").hide()
    $("#speedTestStopActions").hide()
    clearInterval(progressInterval)
    initPerformance()
    console.log(action)
}

// function for ESN speed test
function speedTestModalDisplayAndHideOther(){
    hideAll("speedTestModalDisplayAndHideOther")
    $("#speedTestModal").modal('show')
    $("#speedTestForm").show()
    $("#durationInput").val("")
    $("#intervalInput").val("")
    $("#speedTestActions").show()
    $("#progress").attr("data-percent","0")
}

function displayLoading(time){
    $("#speedTestLoading").show()
    $("#speedTestStopActions").show()
    $("#progress").progress({percent:0})
    progressInterval = setInterval(()=>{
        var prev = Number($("#progress").attr("data-percent"))
        // $("#progress").attr("data-percent",str(prev+1))
        if(prev<100){
            $("#progress").progress({percent:prev+1})
        }
    },time/100)
}

function stopLoading(){
    $("#speedTestLoading").hide()
    $("#speedTestStopActions").hide()
    clearInterval(progressInterval)
}

function stopSpeedTest(){
    hideAll("stopSpeedTest")
    axios.delete('/speedTest').then((res)=>{
        $("#speedTestStopping").hide()
        $("#speedTestStopResult").show()
        if(res.status==200){
            $("#speedTestStopResult").text("Stop Succeeded")
        }
        else{
            $("#speedTestStopResult").text("Stop Failed")
            console.error(res)
        }
    })
    $("#speedTestStopping").show()
}

function displayPerformance(postPerformance,getPerformance){
    // display performance result message
    $("#speedTestReport").show()
    $("#PostResult").text(postPerformance.toFixed(2))
    $("#GetResult").text(getPerformance.toFixed(2))
}

function sendPostTest(testID){
    var time = Date.now()
    axios.post('/api/v1/messages',{
        sender: 'test',
        reciver: 'test',
        status: 'undefined',
        content: 'it is a 20 char str'+Math.floor(Math.random()*10),
    },{headers:{testid:testID}}).then(()=>{
        time = Date.now() - time
        postTime+=time
        postNum++
    }).catch((err)=>{
        console.log(err.toString())
    })
}

function sendGetTest(testID){
    var time = Date.now()
    axios.get('/api/v1/messages?'+count++,{headers:{testid:testID}}).then(()=>{
        time = Date.now() - time
        getTime+=time
        getNum++
    }).catch((err)=>{
        console.log(err.toString())
    })
}

function testPostRequests(duration,interval,testID){
    postInterval = setInterval(() => {
        sendPostTest(testID)
    }, interval);
    postTimeout = setTimeout(()=>{
        clearInterval(postInterval)
        console.log('post test finished')
        testGetRequests(duration, interval,testID)
    },duration)
}

function testGetRequests(duration, interval,testID){
    getInterval =setInterval(() => {
        sendGetTest(testID)
    }, interval);
    getTimeout =  setTimeout(()=>{
        clearInterval(getInterval)
        console.log("get test finished")
        axios.delete('/speedTest').then((res)=>{
            // stop loading
            stopLoading()
            displayPerformance(1000 / (postTime/postNum),1000/(getTime/getNum))
        })
    },duration)
}

function startSpeedTest(){
    var duration = Number($('#durationInput').val())
    var interval = Number($('#intervalInput').val())
    const testID = `${getCurrentUsername()}-${Date.now()}`;

    if(!isNaN(duration) && !isNaN(interval)){
        duration *= 1000
        // verify times
        if(duration/interval/2 > 1000){
            // display speed test stop result
            $("#speedTestStopResult").show()
            $("#speedTestStopResult").text("POST number exceeds post request 1000 limit (POST Request Limit Rule)")
            return
        }
        else{
            axios.post('/speedTest',{
                testID
            }).then((res)=>{
                // loading
                hideAll("startSpeedTest start")
                displayLoading(duration)
            }).then(()=>{
                // start test
                testPostRequests(duration/2,interval,testID)
            })
        }
    }
}

$(document).ready(() => {
    $(".ui.icon").popup();
})
