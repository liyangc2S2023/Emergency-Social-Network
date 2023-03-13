const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  sender: { type: String, required: true },
  receiver: {
    type: String,
    default: '',
    require: true,
  },
  status: { type: String, require: true, default: '' },
  timestamp: { type: Date, default: Date.now, require: true },
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
    return MessageTable.find({ receiver });
  }

  static async getPrivateMessagesBetween(sender, receiver) {
    return MessageTable.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    });
  }

  static async addMessage(sender, receiver, status, content) {
    return MessageTable.create(
      {
        sender,
        receiver,
        status,
        content,
      },
    );
  }

  static async getLatesMessageBetween(user1, user2) {
    // get latest message between a user and another user
    return MessageTable
      .find({
        $or: [
          { sender: user1, receiver: user2 },
          { sender: user2, receiver: user1 },
        ],
      })
      .sort({ timestamp: -1 })
      .limit(1);
  }
}

module.exports = Message;
