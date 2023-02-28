const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  sender: { type: String, required: true },
  reciver: {
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

  static async getByReciver(reciver) {
    return MessageTable.find({ reciver });
  }

  static async addMessage(sender, reciver, status, content) {
    return MessageTable.create(
      {
        sender,
        reciver,
        status,
        content,
      },
    );
  }
}

module.exports = Message;
