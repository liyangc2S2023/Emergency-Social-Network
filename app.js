const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var session = require('express-session');

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const User = require('./models/user');
require('./database');

const port = 3000;


app.set('view engine', 'pug');
app.set('views', './views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
// app.use(session({ secret: "acdc" }));
app.use(express.static('public'));


const loginRouter = require("./routes/login");
app.use("/login", loginRouter);

app.get('/', (req, res) => {
    res.redirect('/login');
})

// page not found
app.use(function(req,res,next){
    next(createError(404,"page not found"));
})

/* error handling
* use next(createError(status_code,msg)) to throw error
* or directly use: 
* ```
*    var newError=new Error("msg")
*    newError.status=xxx
*    throw newError
* ``` 
*/
app.use(function(err,req,res,next){
    res.status(err.status || 500);
    // err.name: err.message
    res.render("error",{message:err.toString()})
})

console.log("Server started at: http://localhost:"+port)

app.listen(port);
