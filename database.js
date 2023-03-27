const mongoose = require('mongoose');
const SuspendFlag = require('./routes/common/suspendFlag');

// mongodb atlas connection uri
const uri = 'mongodb+srv://liyang:cmstc123@cluster0.4yg6j3d.mongodb.net/';
const dbname = 'FSE-ESN-SB5';

module.exports = async () => {
  mongoose.set('strictQuery', false);
  mongoose.connect(uri + dbname, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', () => {
    console.log('Connected to MongoDB Atlas');
    SuspendFlag.getInstance().stopSuspend()
  });
};
