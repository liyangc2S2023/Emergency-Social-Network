// const express = require('express');
// const Result = require('./common/result');

// const router = express.Router();
// const pug = require('pug');

// const date2Str = require('../utils/dateUtil');
// const config = require('../config');
// const fixOrderController = require('../controller/fixOrderController');

// router.get('/', function (req, res) {
  
//   const fixOrder = {
//     username,
//     helper,
//     description,
//     address,
//     powerStatus,
//   };
//   // emit a socket to update directory ui
//   const newFixOrderHTML = pug.renderFile('./views/fixOrderIten.pug', { fixOrder });
//   req.io.emit('fixOrderList', newFixOrderHTML);
// });


// router.post('/', function(req, res) {
//     // Check the user's role
//     if (req.data.data.role === 'user') {
//       // Redirect to powerReport.pug
//       res.redirect('/powerReport');
//     } else if (req.data.data.role === 'electrician') {
//       // Redirect to powerIssueList.pug
//       res.redirect('/powerIssueList');
//     }
//     const role = fixOrderController.changeRole(req.body.username, req.body.role);
//     req.io.emit('roleChange', { username: req.body.username, role });
//     return res.send(Result.success({ role }));  
// });

// module.exports = router;