const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const createError = require('http-errors');
const http = require('http');

const server = http.createServer(app);
const cookieParser = require('cookie-parser');
const io = require('socket.io')(server);
const setupSocket = require('./socket');
const setupDB = require('./database');

const port = 3000;

setupDB();

app.set('view engine', 'pug');
app.set('views', './views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

setupSocket(io);

// Middleware: socketio
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get('/', (req, res) => {
  res.redirect('/welcome');
});
// app.use("/login", require("./routes/login"));
app.use('/join', require('./routes/joinRouter'));
app.use('/welcome', require('./routes/welcomeRouter'));

// Middleware: JWT(Json Web Token) Authentication
app.use(require('./middleware/jwtMW'));

app.use('/speedTest', require('./routes/speedRoutes'));

// Middleware: suspend normal page if start ESN speed test
app.use(require('./middleware/speedTestMW'));

app.use('/rules', require('./routes/welcomeRulesRouter'));

app.use('/chat', require('./routes/chatRouter'));

// rest APIs
app.use('/api/v1', require('./routes/apiV1Routes'));

app.use('/directory', require('./routes/directoryRouter'));

app.use('/logout', require('./routes/logoutRouter'));

// page not found
app.use((req, res, next) => {
  next(createError(404, `${req.url} page not found`));
});

/* error handling
* use next(createError(status_code,msg)) to throw error
* or directly use:
* ```
*    var newError=new Error("msg")
*    newError.status=xxx
*    throw newError
* ```
*/
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', { error: err });
  next();
});

console.log(`Server started at: http://localhost:${port}`);

server.listen(port);
