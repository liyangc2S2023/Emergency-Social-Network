const express = require('express');
const Result = require('../controller/common/result');
const messageController = require('../controller/messageController');
const userController = require('../controller/userController');
const router = express.Router();
const jwt = require("jsonwebtoken");
const config = require('../config');
const { token } = require('morgan');

router.get('/users', async function (req, res, next) {
    return res.send(Result.success(await userController.getAll()))
});

router.get('/users/current', async function(req,res,next){
    token=req.headers.authorization
    var user = await userController.getCurrentUser(token)
    var username = ""
    try{
        username=jwt.verify(token,config.JWT_KEY).username
    } catch(err){
        console.log(err)
        username = "token invalid"
    }
    var user = await userController.getOne(username)
    // todo: user status haven't added
    if(user){
        return res.send(Result.success({"username":username,"status":user.status}))
    }
    else{
        return res.status(400).send(Result.fail(username,""))
    }
})

router.get('/users/:userId',async function(req,res,next){
    return res.send(Result.success(await userController.getOne(req.params.userId)))
})

router.post('/users',async function(req,res,next){
    return res.send(Result.success(await userController.addUser(req.body.username,req.body.password)))
})

router.get('/messages',async function(req,res,next){
    return res.send(Result.success(await messageController.getAll()))
})

router.post('/messages',async function(req,res,next){
    return res.send(Result.success(await messageController.addMessage(req.body.sender,req.body.reciver,req.body.status,req.body.content)))
})

router.get('/messages/:senderId',async function(req,res,next){
    return res.send(Result.success(await messageController.getBySender(req.params.senderId)))
})

// modify later
// router.get('/messages/:reciverId',async function(req,res,next){
//     return res.send(Result.success(await messageController.getByReciver()))
// })

module.exports = router;
