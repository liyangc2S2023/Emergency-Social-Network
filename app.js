const createError = require('http-errors');

const APP = require('./backend');
const setupDB = require('./database');

const { app, server } = new APP();
// const server = http.createServer(app);

// const setupSocket = require('./socket');

// const io = socketServer(server);
// setupSocket(io);

const port = 3000;

setupDB();

app.set('view engine', 'pug');
app.set('views', './views');

// // Middleware: socketio
// app.use((req, res, next) => {
//   req.io = io;
//   next();
// });

app.get('/', (req, res) => {
  res.redirect('/welcome');
});
// app.use("/login", require("./routes/login"));
app.use('/join', require('./routes/joinRouter'));
app.use('/welcome', require('./routes/welcomeRouter'));

app.use('/api/v1', require('./routes/unauthorizedAPIV1Routes'));

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
