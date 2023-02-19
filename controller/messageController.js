const Message = require("../model/message")

class MessageController{

    async getAll(){
        return await Message.getAll()
    }

    async getBySender(senderName){
        return await Message.getBySender(senderName)
    }

    async addMessage(senderName,reciverName,status,content){
        return await Message.addMessage(senderName,reciverName,status,content)
    }

    async formatNotice(text){
        return Message.formatNotice(text)
    }
}

const messageController=new MessageController()

module.exports=messageController
