const express = require('express');
const Result = require('../controller/common/result');
const messageController = require('../controller/messageController');
const userController = require('../controller/userController');
const router = express.Router();

router.get('/users', async function (req, res, next) {
    return res.send(Result.success(await userController.getAll()))
});

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
    return res.send(Result.success(await messageController.addMessage(req.body.senderName,req.body.reciverName,req.body.status,req.body.content)))
})

router.get('/messages/:senderId',async function(req,res,next){
    return res.send(Result.success(await messageController.getBySender(req.params.senderId)))
})

// modify later
// router.get('/messages/:reciverId',async function(req,res,next){
//     return res.send(Result.success(await messageController.getByReciver()))
// })

module.exports = router;
