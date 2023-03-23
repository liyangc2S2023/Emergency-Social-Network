const Message = require('../model/message');
const User = require('../model/user');

const searchTopics = {
  username: async (searchPhrase) => User.searchByUsername(searchPhrase),
  status: async (searchPhrase) => User.searchByStatus(searchPhrase),
  announcement: async () => {
    // TODO: implement this function after setting up the announcement model.
    // return Announcement.searchByAnnouncement(searchPhrase, page);
  },
  publicMessage: async (searchPhrase, page) => Message.searchByPublicMessage(searchPhrase, page),
  privateMessage:
    // eslint-disable-next-line max-len
    async (searchPhrase, sender, receiver, page) => Message.searchByPrivateMessage(searchPhrase, sender, receiver, page),
};

class searchController {
  static async searchContent(topic, searchPhrase, sender = null, receiver = null, page = 0) {
    let results = [];
    if (!(topic in searchTopics)) {
      return results;
    }
    const searchFunction = searchTopics[topic];
    results = await searchFunction(searchPhrase, sender, receiver, page);
    return results;
  }
}

module.exports = searchController;
