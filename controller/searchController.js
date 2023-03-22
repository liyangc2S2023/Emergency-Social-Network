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
  async (sender, searchPhrase, page) => Message.searchByPrivateMessage(sender, searchPhrase, page),
};

class searchController {
  static async searchContent(username, topic, searchPhrase, page = 0) {
    if (!(topic in searchTopics)) {
      throw new Error('Invalid search topic');
    }
    const searchFunction = searchTopics[topic];
    const results = await searchFunction(username, searchPhrase, page);
    return results;
  }
}

module.exports = searchController;
