const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {type: String, required: true},
  sender : {type:String, required: true},
  reciver: {type:String, 
              default:"", require:true},
  status:{type:String, require:true},
  timestamp: {type:Date, default:Date.now, require: true}
});

const MessageTable = mongoose.model('Message', messageSchema);

class Message{
    static async getAll(){
        return await MessageTable.find()
    }

    static async getBySender(senderName){
        return await MessageTable.find({"sender":senderName})
    }

    static async getByReciver(){
        return await MessageTable.find({"reciver":reciverName})
    }

    static async addMessage(senderName,reciverName,status,content){
        return await MessageTable.create(
            {"sender":senderName,"reciver":reciverName,
            "status":status,
            "content":content})
    }

    static async getByReciver(){
        return await MessageTable.find({"reciver":reciverName})
    }

    static async formatNotice(text) {
        return{
            sender:"Notice",
            text,
            time: moment().format("MM.DD.YYYY HH:mmA")
    
        }
    }
}

module.exports = Message