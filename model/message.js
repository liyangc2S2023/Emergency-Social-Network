const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  sender: { type: String, required: true },
  receiver: {
    type: String,
    default: '',
    require: true,
  },
  status: { type: String, required: true, default: '' },
  timestamp: { type: Date, default: Date.now, required: true },
  isRead: { type: Boolean, default: false },
});

const MessageTable = mongoose.model('Message', messageSchema);

class Message {
  static async getAll() {
    return MessageTable.find();
  }

  static async getBySender(sender) {
    return MessageTable.find({ sender });
  }

  static async getMessageByReceiverOrRoom(receiver) {
    return MessageTable.find({ receiver }).sort({ timestamp: 1 });
  }

  static async getPrivateMessagesBetween(sender, receiver) {
    return MessageTable.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ timestamp: 1 });
  }

  static async addMessage(sender, receiver, status, content, timestamp = Date.now()) {
    return MessageTable.create(
      {
        sender,
        receiver,
        status,
        content,
        timestamp,
      },
    );
  }

  static async getLatestMessageBetween(user1, user2) {
    // get latest message between a user and another user
    const message = await MessageTable
      .find({
        $or: [
          { sender: user1, receiver: user2 },
          { sender: user2, receiver: user1 },
        ],
      })
      .sort({ timestamp: -1 })
      .limit(1);
    // return message.length == 1 ? message[0].content : "";
    return message[0];
  }

  static async userReadMessage(sender, receiver) {
    return MessageTable.updateMany(
      {
        sender,
        receiver,
        isRead: false,
      },
      { isRead: true },
    );
  }

  static async getUserUnreadMessage(receiver) {
    return MessageTable.find({
      receiver,
      isRead: false,
    });
  }

  static async getAllUsernamesWithUnreadMessage(receiver) {
    const unreadMessage = await Message.getUserUnreadMessage(receiver);
    const usernames = new Set();
    unreadMessage.forEach((message) => {
      usernames.add(message.sender);
    });
    return usernames;
  }

  static async searchByPublicMessage(keywords, page = 0, limit = 10) {
    // '|' for matching either values, 'i' for case insensitive
    const regex = new RegExp(keywords.join('|'), 'i');
    const messages = await MessageTable.find({ content: regex, receiver: 'all' })
      .sort({ timestamp: -1 })
      .skip(page * limit)
      .limit(limit);
    return messages;
  }

  static async searchByPrivateMessage(keywords, sender, receiver, page = 0, limit = 10) {
    // '|' for matching either values, 'i' for case insensitive
    const regex = new RegExp(keywords.join('|'), 'i');
    const messages = await MessageTable
      .find({
        content: regex,
        $or: [
          { sender, receiver },
          { sender: receiver, receiver: sender },
        ],
      })
      .sort({ timestamp: -1 })
      .skip(page * limit)
      .limit(limit);
    return messages;
  }
}

module.exports = Message;
