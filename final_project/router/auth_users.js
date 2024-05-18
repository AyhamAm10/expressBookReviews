const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Middleware to parse JSON bodies
regd_users.use(bodyParser.json());

// Function to check if the username is valid (exists)
const isValid = (username) => {
    return users.some(user => user.username === username);
}

// Function to authenticate user credentials
const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username && user.password === password);
    return user !== undefined;
}

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, 'your_jwt_secret_key', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Register a new user
regd_users.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    if (isValid(username)) {
        return res.status(400).json({ error: 'Username already exists' });
    }

    users.push({ username, password });
    res.status(201).json({ message: 'User registered successfully', users: users });
});

// Login as a registered user
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ username }, 'your_jwt_secret_key', { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", authenticateToken, (req, res) => {
    const { review } = req.body;
    const { isbn } = req.params;
    const username = req.user.username;

    if (!review) {
        return res.status(400).json({ error: 'Review is required' });
    }

    if (!books[isbn]) {
        return res.status(404).json({ error: 'Book not found' });
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    res.status(200).json({ message: 'Review added/modified successfully', reviews: books[isbn].reviews });
});

regd_users.delete("/auth/review/:isbn", authenticateToken, (req, res) => {
    const { isbn } = req.params;
    const username = req.user.username;

    if (!books[isbn]) {
        return res.status(404).json({ error: 'Book not found' });
    }

    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ error: 'Review not found' });
    }

    delete books[isbn].reviews[username];

    res.status(200).json({ message: 'Review deleted successfully', reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
