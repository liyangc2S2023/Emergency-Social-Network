const express = require('express');
const router = express.Router();


router.get('/', function (req, res) {
    res.render('mainPage',{pageView:"Public"});
});


module.exports = router;
