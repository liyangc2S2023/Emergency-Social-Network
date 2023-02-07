const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const createError = require('http-errors');
const jwt = require("jsonwebtoken");
const config = require('./config')
require('./database')
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const cookieParser = require('cookie-parser')

const port = 3000;

app.set('view engine', 'pug');
app.set('views', './views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser())

app.get('/', (req, res) => {
    res.redirect('/welcome');
})

// app.use("/login", require("./routes/login"));
app.use("/join", require("./routes/joinRouter"));
app.use("/welcome", require("./routes/welcomeRouter"));

// Middleware: JWT(Json Web Token) Authentication
// app.use(function(req,res,next){
//     const token = req.body.token || req.query.token || req.headers.authorization || req.cookies['user_token']
//     if(!token){
//         next(createError(401,"token required"))
//     }
//     else{
//         try{
//             const decoded=jwt.verify(token,config.JWT_KEY)
//             req.username=decoded.username
//             next()
//         } catch(err){
//             next(createError(401,"token invalid"+err.toString()))        
//         }
//     }
// })

app.use("/rules", require("./routes/welcomeRulesRouter"));

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