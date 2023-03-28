const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const setupDB = require('../database');

class SpeedRecord {
  static instance;

  mongoServer;

  constructor() {
    this.mongoServer = null;
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new SpeedRecord();
    return this.instance;
  }

  async setTestDB(type = 'in-memory') {
    if (type === 'in-memory') {
      this.mongoServer = await MongoMemoryServer.create();
      const mongoUri = this.mongoServer.getUri();
      await mongoose.disconnect();
      await mongoose.connect(mongoUri);
      console.log('Connect to In-Memory TestDB');
    }
  }

  async resetDB() {
    await mongoose.disconnect();
    await this.mongoServer.stop();
    await setupDB();
  }
}

module.exports = SpeedRecord;
