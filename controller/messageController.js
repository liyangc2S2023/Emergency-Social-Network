const Message = require('../model/message');

class MessageController {
  static async getAll() {
    return Message.getAll();
  }

  static async getBySender(sender) {
    return Message.getBySender(sender);
  }

  // static async getMessageByReceiverOrRoom(receiver) {
  //   return Message.getMessageByReceiverOrRoom(receiver);
  // }

  static async getPrivateMessagesBetween(sender, receiver) {
    return Message.getPrivateMessagesBetween(sender, receiver);
  }

  static async addMessage(sender, receiver, status, content) {
    return Message.addMessage(sender, receiver, status, content);
  }

  // static async getLatestMessageBetween(user1, user2) {
  //   // get latest message between a user and another user
  //   return Message.getLatestMessageBetween(user1, user2);
  // }

  // static async markAsRead(sender, receiver) {
  //   return Message.userReadMessage(sender, receiver);
  // }

  static async getAllUsernamesWithUnreadMessage(receiver) {
    return Array.from(await Message.getAllUsernamesWithUnreadMessage(receiver));
  }
}

module.exports = MessageController;
