class Result {
  /**
     * result for all http request
     * @param {boolean} success is request succeed
     * @param {String} message respond message to explain (optional)
     * @param {object} data respond data (optional)
     */
  constructor(success, message, data) {
    this.success = success;
    this.message = message;
    this.data = data;
  }

  static success(data) {
    return new Result(true, '', data);
  }

  static fail(msg, data) {
    return new Result(false, msg, data);
  }

  getSuccess() {
    return this.success;
  }

  getMessage() {
    return this.message;
  }

  getData() {
    return this.data;
  }

  setSuccess(success) {
    this.success = success;
  }

  setMessage(message) {
    this.message = message;
  }

  setData(data) {
    this.data = data;
  }
}

module.exports = Result;
