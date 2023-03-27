const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// const createError = require('http-errors');
const apiRoute = require('./routes/apiV1Routes');

// const app = express();

class App {
  constructor(uri) {
    this.app = express();
    this.setupMiddlewares();
    this.dbUri = uri;
    this.server = http.createServer(this.app);
  }

  setupMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(express.static('public'));
    this.app.use(cookieParser());
  }

  setupRestfulRoutes = () => {
    this.app.use('/api/v1', apiRoute);
  };
}

module.exports = App;
