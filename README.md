# s23-ESN-SB5
YOU ARE *NOT* PERMITTED TO SHARE THIS REPO OUTSIDE THIS GITHUB ORG. YOU ARE *NOT* PERMITTED TO FORK THIS REPO UNDER ANY CIRCUMSTANCES. YOU ARE *NOT* PERMITTED TO CREATE ANY PUBLIC REPOS INSIDE THE CMUSV-FSE ORGANIZATION.  YOU SHOULD HAVE LINKS FROM THIS README FILE TO YOUR PROJECT DOCUMENTS, SUCH AS YOUR REST API SPECS AND YOUR ARCHITECTURE DOCUMENT. *IMPORTANT*: MAKE SURE TO CHECK AND UPDATE YOUR LOCAL GIT CONFIGURATION IN ORDER TO MATCH YOUR LOCAL GIT CREDENTIALS TO YOUR SE-PROJECT GITHUB CREDENTIALS (COMMIT USING THE SAME EMAIL ASSOCIATED WITH YOUR GITHUB ACCOUNT): OTHERWISE YOUR COMMITS WILL NOT BE INCLUDED IN GITHUB STATISTICS AND REPO AUDITS WILL UNDERESTIMATE YOUR CONTRIBUTION. 


# Technology Decisions
## Back-end 
### Node.js: https://nodejs.org/
Node.js is a great choice for building fast, scalable, and efficient web applications that are easy to learn and compatible with multiple platforms.

### Express.js: https://expressjs.com/
Express.js is a minimal and flexible framework that provides fast performance and is easy to set up. Express.js is highly customizable, allowing you to add or remove functionality as needed. This means that you can tailor the framework to meet the specific needs of your project.

### socket.io: https://socket.io/
Socket.io enables real-time communication between the client and server, making it possible to build applications with real-time updates and notifications. Socket.io is designed to work with a variety of browsers and platforms, making it a versatile choice for building cross-browser compatible applications.

### CryptoJS: https://cryptojs.gitbook.io/
CryptoJS is a growing library of standard and secure cryptographic algorithms implemented in JavaScript using best practices and patterns. They are fast and have a consistent and simple interface. We will use it as our library to encrypt and decrypt.

### Jest: https://jestjs.io/
Jest is a delightful JavaScript Testing Framework with a focus on simplicity. It is fast, safe and has great exceptions. It can easily implement mocking and support code coverage with no additional setup.

## Front-end
### Pug: https://pugjs.org/
Pug has a clean and readable syntax, which makes it easy to write and maintain complex templates. Pug enables dynamic HTML generation, making it easy to build templates that can be customized and reused for different pages or components. Pug is optimized for performance, making it a fast and efficient choice for building complex HTML templates.

### CSS3: https://www.w3.org/TR/css-2015/
CSS3 provides improved styling capabilities, including new selectors, layout modules, and animation features, which allow for more dynamic and creative styles. CSS3 provides better control over layout and positioning of elements, making it easier to create complex and responsive designs. CSS3 is widely supported by modern browsers, making it a versatile choice for building cross-browser compatible web applications.

### jQuery: https://jquery.com/
jQuery is a popular JavaScript library that makes it easier to handle HTML document traversal, event handling, and animation. jQuery provides cross-browser compatibility, making it easy to write JavaScript code that works consistently across different browsers.

### Semantic UI: https://semantic-ui.com/
Semantic UI is a development framework for building user interfaces that provides responsive design, customizable themes, built-in UI elements, user-friendly documentation, and a large community.

### Axios: https://axios-http.com/
Axios is a simple promise based HTTP client for the browser and node.js. Axios provides a simple to use library in a small package with a very extensible interface. We will use it to send HTTP request from client to server.

### Json Web Token: https://jwt.io/
JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. This information can be verified and trusted because it is digitally signed.JWTs can be signed using a secret (with the HMAC algorithm) or a public/private key pair using RSA or ECDSA. We will use it for authentication.

## Database
### MongoDB: https://www.mongodb.com/
MongoDB is a popular NoSQL database management system. It is designed to store and manage large amounts of semi-structured and unstructured data, making it a good choice for modern web applications. MongoDB uses a document-oriented data model, which allows you to store complex data structures as documents within a collection. MongoDB is highly scalable and flexible, allowing you to easily add or remove nodes from your database cluster as your needs change. MongoDB provides a rich query language that allows you to easily retrieve, manipulate, and update data stored in your database.

# Package Usage

### How to run this project code
    $ npm install
    $ node app.js
    or $ npm run dev (recommanded, see config in package.json)

if you wish to auto-reload the page, then run:

    $ npx nodemon app.js

### How to run unit test
    $ npm test

# Data Format
### Result
Path: *./model/result.js*

Data format sent from backend to frontend

```json
{
    "success":true, // boolean value, indicate the request result is success or not
    "message":"login success", // message for frontend developer, may not display directly to user
    "data":{ // any form of respond data
        "username":"cr"
    }
}
```

### Error

All error will globally handled in *app.js*

**usage**

```javascript
// method 1: use library (recommanded)
const createError = require('http-errors');
next(createError(401,"token required")) // create 401 unauthorized error with message at second parameter

// method 2: construct by yourself (could be designed better)
var newError=new Error("msg")
newError.status=400
throw newError
```