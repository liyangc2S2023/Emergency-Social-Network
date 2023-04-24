const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const SuspendFlag = require('./routes/common/suspendFlag');
const User = require('./model/user');
const config = require('./config');

// mongodb atlas connection uri
const defaultUri = 'mongodb+srv://liyang:cmstc123@cluster0.4yg6j3d.mongodb.net/';
const dbname = 'FSE-ESN-SB5';
// let mongoServer;

class database {
  constructor(dbtype, uri, databaseName) {
    this.mongoServer = null;
    this.db = null;
    this.connection = null;
    this.uri = uri || defaultUri;
    this.dbtype = dbtype;
    this.dbname = databaseName || dbname;
  }

  async connect() {
    if (this.dbtype === 'production') {
      mongoose.set('strictQuery', false);
      mongoose.connect(this.uri + this.dbname, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } else {
      this.mongoServer = await MongoMemoryServer.create();
      const mongoUri = this.mongoServer.getUri();
      await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
      const { connection } = mongoose;
      this.connection = connection;
    }

    this.db = mongoose.connection;
    this.db.on('error', console.error.bind(console, 'connection error:'));
    this.db.once('open', async () => {
      console.log('Connected to MongoDB Atlas');
      SuspendFlag.getInstance().stopSuspend();
      if ((await User.getOne('esnadmin')) === null) {
        await User.addUser('esnadmin', 'admin', config.USER_ROLE.ADMIN, config.USER_STATUS.OK);
      }
    });
  }

  async freshTables() {
    if (this.dbtype !== 'production') {
      await this.connection.db.dropDatabase();
    }
  }

  async disconnect() {
    if (this.dbtype === 'production') {
      await mongoose.disconnect();
    } else {
      await this.mongoServer.stop();
    }
  }
}

module.exports = database;
