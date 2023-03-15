// function for ESN speed test
function speedTestModalDisplayAndHideOther(action){
    $("#speedTestStopActions").hide()
    $("#speedTestForm").hide()
    $("#speedTestActions").hide()
    $("#speedTestLoading").hide()
    $("#speedTestReport").hide()
    $("#speedTestForm").show()
    $("#speedTestActions").show()
    $("#durationInput").val("")
    $("#intervalInput").val("")
    $("#speedTestStopResult").hide()
    $("#speedTestStopping").hide()
    $("#progress").attr("data-percent","0")
    clearInterval(progressInterval)
}

function displayLoading(time){
    $("#speedTestLoading").show()
    $("#progress").progress({percent:0})
    progressInterval = setInterval(()=>{
        var prev = Number($("#progress").attr("data-percent"))
        // $("#progress").attr("data-percent",str(prev+1))
        $("#progress").progress({percent:prev+1})
    },time*10)
}

function stopSpeedTest(){
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
    $("#speedTestStop").hide()
    $("#speedTestLoading").hide()
    clearInterval(progressInterval)
}

function startSpeedTest(){
    var duration = Number($('#durationInput').val())
    var interval = Number($('#intervalInput').val())
    if(!isNaN(duration) && !isNaN(interval)){
        axios.post('/speedTest',{
            duration,
            interval
        },{timeout:(duration+5)*1000}).then((res)=>{
            // stop loading
            clearInterval(progressInterval)
            $("#speedTestLoading").hide()
            $("#speedTestStop").hide()
            var data = res.data.data
            if(data.exitStatus==0){
                // display message
                $("#speedTestReport").show()
                $("#PostResult").text(data.postPerformance.toFixed(2))
                $("#GetResult").text(data.getPerformance.toFixed(2))
            } else if(data.exitStatus==1){
                $("#speedTestStopResult").show()
                $("#speedTestStopResult").text("POST number exceeds post request limit (POST Request Limit Rule)")
            }
        })
        // loading
        displayLoading(duration)
        $("#speedTestForm").hide()
        $("#speedTestActions").hide()
        $("#speedTestStop").show()
    }
}

$(document).ready(() => {
    $(".ui.icon").popup();
})
