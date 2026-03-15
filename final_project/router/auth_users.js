const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

// Check if the user exists and the password matches
const authenticatedUser = (username, password) => { 
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
      return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
      return true;
    } else {
      return false;
    }
  }

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    // Check if username and password are provided
    if (!username || !password) {
      return res.status(404).json({ message: "Error logging in: Missing username or password" });
    }
  
    // Authenticate the user using our helper function
    if (authenticatedUser(username, password)) {
      // Generate JWT token. Note: the secret is "access" to match your middleware!
      let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60 * 60 }); // Token expires in 1 hour
  
      // Save token and username to the session
      req.session.authorization = {
        accessToken, username
      }
      return res.status(200).send("User successfully logged in");
    } else {
      return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
  });

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    // Extract the ISBN from the URL parameters
    const isbn = req.params.isbn;
    
    // Extract the review text from the request query (e.g., ?review=GreatBook)
    const review = req.query.review;
    
    // Extract the username from the session authorization object
    const username = req.session.authorization['username'];
    
    // Check if the book exists in our database
    if (books[isbn]) {
      // Add or modify the review for this specific user
      books[isbn].reviews[username] = review;
      
      return res.status(200).send(`The review for the book with ISBN ${isbn} has been added/updated.`);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    // Extract the ISBN from the URL parameters
    const isbn = req.params.isbn;
    
    // Extract the username from the session authorization object
    const username = req.session.authorization['username'];
    
    // Check if the book exists
    if (books[isbn]) {
      // Check if the user has actually posted a review for this book
      if (books[isbn].reviews[username]) {
        // Delete the review associated with this username
        delete books[isbn].reviews[username];
        return res.status(200).send(`Review for the book with ISBN ${isbn} posted by the user ${username} has been deleted.`);
      } else {
        return res.status(404).json({ message: "Review not found for this user" });
      }
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
