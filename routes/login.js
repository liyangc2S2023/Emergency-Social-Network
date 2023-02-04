const e = require('express');
const express = require('express');
const router = express.Router();
// required for database connection
require('../database');
// required for user model
const User = require('../models/user');

router.get('/', function (req, res) {
    res.render('login');
});

router.post('/', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        // print the user found by database
        console.log(req.body.username);
        console.log(user);
        if (!user) return res.status(404).send('User not found');
        if (user.password !== req.body.password) return res.status(401).send('Incorrect password');
        res.redirect('/room');
    } catch (error) {
        res.send(error);
    }
});

module.exports = router;
