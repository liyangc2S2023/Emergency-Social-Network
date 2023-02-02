const express = require('express');
const router = express.Router();
// const users = require('../services/users');

// backdoor for demo
// (TODO): remove for prod
// router.get('/users', async function (req, res, next) {
//     try {
//         res.json(await users.getUsers());
//     } catch (err) {
//         console.error('Error getting users', err.message);
//         next(err);
//     }
// });

router.get('/', function (req, res) {
    res.render('login');
});


router.post('/', async function (req, res) {
    Users = await users.getUsers();
    console.log(Users);
    if (!req.body.id || !req.body.password) {
        res.render('login', { message: "Please enter both id and password" });
    } else {
        var u;
        Users.filter(function (user) {
            if (user.name === req.body.id && user.password === req.body.password) {
                // nasty transform
                user.id = user.name;
                u = user;
            }
        });
        // console.log(u)
        if (u) {
            req.session.user = u;
            res.redirect('/room');
        } else {
            res.render('login', { message: "Invalid credentials!" });
        }
    }
});

module.exports = router;
