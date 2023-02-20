const express = require('express');
// const joinController = require('../controller/JoinController');
const router = express.Router();


router.get('/', function (req, res) {
    res.render('mainPage');
});