/** f
 * convert date to string format
 * @param {Date} date
 * @returns
 */
function date2Str(date) {
  const day = date.getMonth() < 9 ? `0${date.getMonth() + 1}` : (date.getMonth() + 1);
  const month = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  const hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
  const minute = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
  return `${day}.${month}.${date.getFullYear()} ${hour}:${minute}`;
}

module.exports = date2Str;
