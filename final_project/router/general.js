const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const handelFindTitle = (author , method )=>{
    let trueAuthor = {};
    for(let i =1 ;  i<= 10 ;  i++ ){
        const index = `${i}`
        if(books[index]){
            if(books[index][method] == author){
            trueAuthor = books[index]
            }
        }
    }
    return trueAuthor;
}
public_users.post("/register", (req,res) => {
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

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.status(200).json(books)
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn
  const data = books[isbn]
  return res.status(200).json(data);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author
    console.log(author)
    const content = handelFindTitle(author , 'author')
    console.log(content)
    return res.status(200).json( content)
});
// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title
    const content = handelFindTitle(title , 'title')
    return res.status(200).json( content)

});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn
    const data = books[isbn].reviews
    return res.status(200).json({rev : data});
});

// Function to get books using Promise callbacks
async function getAllBooksAsync(callback) {
    try {
        const response = await axios.get('http://your_api_endpoint/books');
        callback(null, response.data);
    } catch (error) {
        callback(error, null);
    }
}



// Function to get book details based on ISBN using Promise callbacks
function searchBookByISBN(isbn) {
    return new Promise((resolve, reject) => {
        axios.get(`http://your_api_endpoint/books/${isbn}`)
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}


// Function to search for a book by title using Promises
function searchBookByTitle(title) {
    return new Promise((resolve, reject) => {
        axios.get(`http://your_api_endpoint/books?title=${title}`)
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}







module.exports.general = public_users;
