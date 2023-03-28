const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const socketServer = require('socket.io');

// const createError = require('http-errors');
const apiRoute = require('./routes/apiV1Routes');
const jwtMW = require('./middleware/jwtMW');
const setupSocket = require('./socket');

class App {
  constructor(uri) {
    this.app = express();
    this.setupMiddlewares();
    this.dbUri = uri;
    this.server = http.createServer(this.app);
    this.io = socketServer(this.server);
    setupSocket(this.io);
  }

  setupMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(express.static('public'));
    this.app.use(cookieParser());
    // Middleware: socketio
    this.app.use((req, res, next) => {
      req.io = this.io;
      next();
    });
    // Middleware: JWT(Json Web Token) Authentication
  }

  setupRestfulRoutes = () => {
    this.app.use('/api/v1', apiRoute);
    this.app.use(jwtMW);
  };
}

module.exports = App;
