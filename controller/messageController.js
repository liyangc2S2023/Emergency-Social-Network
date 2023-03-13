const Message = require('../model/message');

class MessageController {
  static async getAll() {
    return Message.getAll();
  }

  static async getBySender(sender) {
    return Message.getBySender(sender);
  }

  static async getByReceiver(receiver) {
    return Message.getByreceiver(receiver);
  }

  static async getByPrivate(sender, receiver) {
    return Message.getByPrivate(sender, receiver);
  }

  static async addMessage(sender, receiver, status, content) {
    return Message.addMessage(sender, receiver, status, content);
  }

  static async getUserLatestMessage(user1, user2) {
    // get latest message between a user and another user
    return Message.getUserLatestMessage(user1, user2);
  }

}

module.exports = MessageController;
