const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if the user has an active session and an authorization object
    if (req.session.authorization) {
      // Extract the JWT token from the session
      let token = req.session.authorization['accessToken'];
  
      // Verify the JWT token
      // Note: "access" is the secret key. Make sure this matches the secret you use when signing the token in your login route!
      jwt.verify(token, "access", (err, user) => {
        if (!err) {
          // Token is valid: save user payload to request and proceed
          req.user = user;
          next(); 
        } else {
          // Token is invalid or expired
          return res.status(403).json({ message: "User not authenticated" });
        }
      });
    } else {
      // No session found
      return res.status(403).json({ message: "User not logged in" });
    }
  });
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
