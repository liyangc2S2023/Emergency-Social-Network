const Message = require('../model/message');
const User = require('../model/user');
const Status = require('../model/status');
const Announcement = require('../model/announcement');
const stopWords = require('../public/search_stopWord.json').stopWord;

const searchTopics = {
  // eslint-disable-next-line max-len
  username: async (searchPhrase, sender, receiver, page) => User.searchByUsername(searchPhrase, page),
  status: async (searchPhrase, sender, receiver, page) => User.searchByStatus(searchPhrase, page),
  // eslint-disable-next-line max-len
  announcement: async (searchPhrase, sender, receiver, page) => Announcement.searchByAnnouncement(searchPhrase, page),
  // eslint-disable-next-line max-len
  publicMessage: async (searchPhrase, sender, receiver, page) => Message.searchByPublicMessage(searchPhrase, page),
  privateMessage:
    // eslint-disable-next-line max-len
    async (searchPhrase, sender, receiver, page) => {
      if (searchPhrase.length === 1 && searchPhrase[0] === 'status') {
        return Status.searchHistoryStatus(receiver, page);
      }
      return Message.searchByPrivateMessage(searchPhrase, sender, receiver, page);
    },
};

class searchController {
  static async searchContent(topic, searchPhrase, sender = null, receiver = null, page = 0) {
    // check if searchPhrase contains only stop words
    const isStopWord = searchPhrase.every((word) => stopWords.includes(word));
    let results = [];
    if (!(topic in searchTopics) || isStopWord) {
      console.log('invalid search context or criteria');
      return results;
    }
    const searchFunction = searchTopics[topic];
    results = await searchFunction(searchPhrase, sender, receiver, page);
    return results;
  }
}

module.exports = searchController;
