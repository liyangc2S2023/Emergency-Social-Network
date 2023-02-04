const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const createError = require('http-errors');
const jwt = require("jsonwebtoken");
const config = require('./config')

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const port = 3000;


app.set('view engine', 'pug');
app.set('views', './views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


const loginRouter = require("./routes/login");
app.use("/login", loginRouter);

app.get('/', (req, res) => {
  res.redirect('/login');
})

// TODO: move to a router
app.get('/register1', (req, res) => {
  res.render('join_community');
});

app.get('/register2', (req, res) => {
  res.render('new_user_create');
});

app.get('/register3', (req, res) => {
  res.render('welcome_rules');
});

// Middleware: JWT(Json Web Token) Authentication
app.use(function(req,res,next){
    const token = req.body.token || req.query.token || req.headers.authorization
    if(!token){
        next(createError(401,"token required"))
    }
    else{
        try{
            const decoded=jwt.verify(token,config.JWT_KEY)
            req.username=decoded.username
            next()
        } catch(err){
            next(createError(401,"token invalid"+err.toString()))        
        }
    }
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
    res.render("error",{error:err})
})

console.log("Server started at: http://localhost:"+port)

app.listen(port);
