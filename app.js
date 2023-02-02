const express = require('express')
const app = express()
var bodyParser = require('body-parser');
var session = require('express-session');

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const port = 3000


app.set('view engine', 'pug');
app.set('views', './views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
// app.use(session({ secret: "acdc" }));
app.use(express.static('public'))


const loginRouter = require("./routes/login");
app.use("/login", loginRouter);

app.get('/', (req, res) => {
    res.redirect('/login');
})

console.log("Server started listening at port: ", port)

app.listen(port);
