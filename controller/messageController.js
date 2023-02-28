const Message = require('../model/message');

class MessageController {
  static async getAll() {
    return Message.getAll();
  }

  static async getBySender(sender) {
    return Message.getBySender(sender);
  }

  static async addMessage(sender, reciver, status, content) {
    return Message.addMessage(sender, reciver, status, content);
  }
}

module.exports = MessageController;
