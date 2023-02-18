const express = require('express');
const router = express.Router();


router.post('/', function (req, res) {
    // if user is the user
    // clear user states
    // render welcome
    res.render('welcome');
});