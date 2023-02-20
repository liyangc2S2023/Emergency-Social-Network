const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {type: String, required: true},
  sender : {type:String, required: true},
  reciver: {type:String, 
              default:"", require:true},
  status:{type:String, require:true, default:""},
  timestamp: {type:Date, default:Date.now, require: true}
});

const MessageTable = mongoose.model('Message', messageSchema);

class Message{
    static async getAll(){
        return await MessageTable.find()
    }

    static async getBySender(sender){
        return await MessageTable.find({"sender":sender})
    }

    static async getByReciver(){
        return await MessageTable.find({"reciver":reciver})
    }

    static async addMessage(sender,reciver,status,content){
        return await MessageTable.create(
            {"sender":sender,"reciver":reciver,
            "status":status,
            "content":content})
    }

    static async getByReciver(){
        return await MessageTable.find({"reciver":reciverName})
    }

}

module.exports = Message