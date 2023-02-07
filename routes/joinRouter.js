const express = require('express');
const joinService = require('../service/joinService');
const Authentication = require('../service/authentication');
const Result = require('../model/result');
const router = express.Router();


router.get('/', function (req, res) {
    res.render('join', {result: new Result(true,'abc',{prompt:0})});
});

router.post('/', async function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    await joinService.join(res,username,password,next)

});

module.exports = router;
