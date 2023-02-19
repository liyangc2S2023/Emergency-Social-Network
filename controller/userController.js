const User = require("../model/user")

class UserController{

    async getAll(){
        return await User.getAll()
    }

    async getOne(username){
        return await User.getOne(username)
    }

    async addUser(username,password){
        return await User.addUser(username.toLowerCase(),password.toLowerCase())
    }

    async login(username,password){
        //todo: finish in iteration one
    }

    async logout(username,password){
        //todo: finish in iteration one
    }

}

const userController=new UserController()

module.exports=userController
