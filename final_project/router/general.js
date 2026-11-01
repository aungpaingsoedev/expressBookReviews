const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const sendJSON = (res, data) => {
  res.setHeader('Content-Type', 'application/json');
  return res.send(JSON.stringify(data, null, 4));
};

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username: username, password: password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return sendJSON(res, books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return sendJSON(res, book);
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const filtered = {};
  for (const isbn in books) {
    if (books[isbn].author === author) {
      filtered[isbn] = books[isbn];
    }
  }
  return sendJSON(res, filtered);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const filtered = {};
  for (const isbn in books) {
    if (books[isbn].title === title) {
      filtered[isbn] = books[isbn];
    }
  }
  return sendJSON(res, filtered);
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return sendJSON(res, book.reviews);
});

// Task 10: get all books using async/await and Axios
async function getAllBooks() {
  const response = await axios.get('http://localhost:5000/');
  return response.data;
}

// Task 11: get book details by ISBN using async/await and Axios
async function getBookByISBN(isbn) {
  const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
  return response.data;
}

// Task 12: get books by author using async/await and Axios
async function getBooksByAuthor(author) {
  const response = await axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`);
  return response.data;
}

// Task 13: get books by title using async/await and Axios
async function getBooksByTitle(title) {
  const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
  return response.data;
}

public_users.get('/axios/books', async (req, res) => {
  try {
    return res.json(await getAllBooks());
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

public_users.get('/axios/isbn/:isbn', async (req, res) => {
  try {
    return res.json(await getBookByISBN(req.params.isbn));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book by ISBN" });
  }
});

public_users.get('/axios/author/:author', async (req, res) => {
  try {
    return res.json(await getBooksByAuthor(req.params.author));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by author" });
  }
});

public_users.get('/axios/title/:title', async (req, res) => {
  try {
    return res.json(await getBooksByTitle(req.params.title));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by title" });
  }
});

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
