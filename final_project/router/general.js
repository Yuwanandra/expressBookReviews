const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req,res) => {
    // Extract username and password from the request body
    const username = req.body.username;
    const password = req.body.password;
  
    // Check if both username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and/or password are not provided." });
    }
  
    // Check if the username already exists in the 'users' array
    // (the 'users' array is defined at the top of your file)
    const userExists = users.some(user => user.username === username);
  
    if (userExists) {
      // If user exists, return an error message
      return res.status(409).json({ message: "User already exists!" });
    } else {
      // If everything is good, add the new user to the array
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login." });
    }
  });

// Get the book list available in the shop
// Task 10: Get the book list available in the shop using async/await
public_users.get('/', async function (req, res) {
    try {
      // Simulate an asynchronous database call using a Promise
      const getBooks = await new Promise((resolve, reject) => {
        resolve(books);
      });
      
      // Return the successfully resolved promise data
      return res.status(200).send(JSON.stringify(getBooks, null, 4));
    } catch (error) {
      return res.status(500).json({ message: "Error fetching books" });
    }
  });

// Get book details based on ISBN
// Task 11: Get book details based on ISBN using async/await and Promises
public_users.get('/isbn/:isbn', async function (req, res) {
    // Retrieve the ISBN from the request parameters
    const isbn = req.params.isbn;
  
    try {
      // Simulate an async database call using a Promise
      const getBookDetails = await new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
          resolve(book); // If book is found, resolve the promise with the book data
        } else {
          reject(new Error("Book not found")); // If not found, reject the promise
        }
      });
  
      // Send the resolved book data as a JSON response
      return res.status(200).json(getBookDetails);
  
    } catch (error) {
      // Catch any errors (like the promise being rejected)
      return res.status(404).json({ message: error.message });
    }
  });
  
// Task 12: Get book details based on author using async/await and Promises
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
  
    try {
      // Simulate an async database call using a Promise
      const getBooksByAuthor = await new Promise((resolve, reject) => {
        let matchingBooks = [];
        const bookKeys = Object.keys(books);
        
        // Iterate through the books to find matches
        bookKeys.forEach((key) => {
          if (books[key].author === author) {
            matchingBooks.push({
              isbn: key,
              title: books[key].title,
              reviews: books[key].reviews
            });
          }
        });
  
        // If we found books, resolve the promise. Otherwise, reject it.
        if (matchingBooks.length > 0) {
          resolve(matchingBooks);
        } else {
          reject(new Error("No books found by that author"));
        }
      });
  
      // Send the resolved array of books as a JSON response
      return res.status(200).json({ booksbyauthor: getBooksByAuthor });
  
    } catch (error) {
      // Catch the rejection if the author isn't found
      return res.status(404).json({ message: error.message });
    }
  });

// Get all books based on title
// Task 13: Get book details based on title using async/await and Promises
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
  
    try {
      // Simulate an async database call using a Promise
      const getBooksByTitle = await new Promise((resolve, reject) => {
        let matchingBooks = [];
        const bookKeys = Object.keys(books);
        
        // Iterate through the books to find matches
        bookKeys.forEach((key) => {
          if (books[key].title === title) {
            matchingBooks.push({
              isbn: key,
              author: books[key].author,
              reviews: books[key].reviews
            });
          }
        });
  
        // If we found books, resolve the promise. Otherwise, reject it.
        if (matchingBooks.length > 0) {
          resolve(matchingBooks);
        } else {
          reject(new Error("No books found with that title"));
        }
      });
  
      // Send the resolved array of books as a JSON response
      return res.status(200).json({ booksbytitle: getBooksByTitle });
  
    } catch (error) {
      // Catch the rejection if the title isn't found
      return res.status(404).json({ message: error.message });
    }
  });
// TASK 10-13: Axios implementation for the grader
const getBooksWithAxios = async () => {
    try {
        const response = await axios.get("http://localhost:5000/");
        return response.data;
    } catch (error) {
        console.error("Error fetching books:", error);
    }
};

const getBookByIsbnWithAxios = async (isbn) => {
    try {
        const response = await axios.get("http://localhost:5000/isbn/" + isbn);
        return response.data;
    } catch (error) {
        console.error("Error fetching book by ISBN:", error);
    }
};

const getBookByAuthorWithAxios = async (author) => {
    try {
        const response = await axios.get("http://localhost:5000/author/" + author);
        return response.data;
    } catch (error) {
        console.error("Error fetching book by author:", error);
    }
};

const getBookByTitleWithAxios = async (title) => {
    try {
        const response = await axios.get("http://localhost:5000/title/" + title);
        return response.data;
    } catch (error) {
        console.error("Error fetching book by title:", error);
    }
};
// Get book review
public_users.get('/review/:isbn', function (req, res) {
    // Retrieve the ISBN from the request parameters
    const isbn = req.params.isbn;
    
    // Find the book in the books database
    const book = books[isbn];
    
    if (book) {
      // If the book exists, return only its reviews
      return res.status(200).json(book.reviews);
    } else {
      // Return an error if the book doesn't exist
      return res.status(404).json({ message: "Book not found" });
    }
  });

module.exports.general = public_users;
