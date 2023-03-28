const express = require('express');

const router = express.Router();
const searchController = require('../controller/searchController');

router.get('/search/:topic/:searchPhrase', async (req, res) => {
  const { topic, searchPhrase } = req.params;
  const results = await searchController.searchContent(topic, searchPhrase);
  res.json(results);
});

router.get('/search/:topic/:searchPhrase/:page', async (req, res) => {
  const { topic, searchPhrase, page } = req.params;
  const results = await searchController.searchContent(topic, searchPhrase, null, null, page);
  res.json(results);
});

router.get('/search/:topic/:searchPhrase/:sender/:receiver/:page', async (req, res) => {
  const {
    topic, searchPhrase, sender, receiver, page,
  } = req.params;
  const results = await searchController.searchContent(topic, searchPhrase, sender, receiver, page);
  res.json(results);
});

module.exports = router;

// router.get('/', async (req, res) => { renderOnePage(req, res, 'Search'); });

// // POST method to handle search keywords
// router.get('/search', async (req, res) => {
//   try {
//     const { collection, searchKeywords } = req.body;

//     let searchResults = [];

//     switch(collection) {
//       case 'user/:searchKeywords':
//         searchResults = await searchController.searchUsername(searchKeywords);
//         break;
//       case 'status/:searchKeywords':
//         searchResults = await searchController.searchUserStatus(searchKeywords);
//         break;
//       case 'announcements':
//         //fill announcemnent controller here
//         searchResults = await .searchAnnouncements(searchKeywords);
//         break;
//       case 'message/public/:searchKeywords':
//         searchResults = await searchController.searchPublicMessages(searchKeywords);
//         break;
//       case 'message/private/:searchKeywords':
//         searchResults = await searchController.searchPrivateMessages(searchKeywords);
//         break;
//       default:
//         throw new Error('Non-found context');
//     }

//     res.render('search', { collection, searchResults, searchKeywords });
//   } catch (err) {
//     res.render('search', { error: err.message });
//   }
// });

// // GET method to display search result
// router.get('/search', (req, res) => {
//   res.render('search');
// });

module.exports = router;
