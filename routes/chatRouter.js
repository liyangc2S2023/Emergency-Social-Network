const express = require('express');
const messageController = require('../controller/messageController');
const userController = require('../controller/userController');
const date2Str = require('../utils/dateUtil');
const router = express.Router();


router.get('/', async function (req, res) {
    await userController.login(req.username)
    var statusMap = {
        "undefined": "circle outline icon",
        "ok": "",
        "help": "",
        "emergency": ""
    }
    // res.render('mainPage',{pageView:"Public"});
    var messageList = await messageController.getAll();
    messageList.forEach(msg => {
        msg.isSender = (req.username == msg.sender)
        msg.time = date2Str(new Date(msg.timestamp))
        msg.statusStyle = statusMap[msg.status]
    })
    res.render('mainPage', { pageView: "Public", messages: messageList })
});


module.exports = router;
