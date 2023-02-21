/**
 * convert date to string format
 * @param {Date} date 
 * @returns 
 */
function date2Str(date){
    var day=date.getMonth()<9?"0"+(date.getMonth()+1):(date.getMonth()+1)
    var month=date.getDate()<10?"0"+date.getDate():date.getDate()
    var hour=date.getHours()<10?"0"+date.getHours():date.getHours()
    var minute=date.getMinutes()<10?"0"+date.getMinutes():date.getMinutes()
    return `${day}.${month}.${date.getFullYear()} ${hour}:${minute}`;
}