const express = require('express');
const joinController = require('../controller/JoinController');
const router = express.Router();


router.get('/', function (req, res) {
    res.render('join');
});

router.post('/', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    var {successflag, joinErr} = joinController.join(username,password)

    // scene 1: user pass not fit rule
    if (successflag) {
        res.status(200)
        res.render('join', {joinComfirm:true,username:username,password:password})
    } else {
        res.status(400)
        res.render('join', {joinErr:joinErr})
    }
    // scene 2: user pass correct
    // return 200 render directory

    // scene 3: user pass mismatch
    // return 400 still render join

    // scene 4: create new user
    // return 200 to join confirm

});

router.post('/confirm', async function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var {successflag,userToken, joinErr} = await joinController.confirmJoin(res,username,password,next)
    console.log(successflag, joinErr)
    if (successflag) {
        res.status(200)
        res.cookie('user_token',userToken)
        res.render('welcomeRules');
    } else {
        res.status(400)
        res.render('join', {joinErr:joinErr,username:username,password:password})
    }
});

module.exports = router;
