const Message = require("../model/message")

class MessageController{

    async getAll(){
        return await Message.getAll()
    }

    async getBySender(sender){
        return await Message.getBySender(sender)
    }

    async addMessage(sender,reciver,status,content){
        return await Message.addMessage(sender,reciver,status,content)
    }
}

const messageController=new MessageController()

module.exports=messageController
