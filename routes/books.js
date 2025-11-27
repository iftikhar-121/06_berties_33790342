// Create a new router
const express = require("express");
const router = express.Router();

const { check, validationResult } = require('express-validator');

const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('../users/login') 
    } else { 
        next ();
    } 
}
// This route just displays the search page for the first time
router.get('/search', function(req, res, next) {
    // Render search.ejs, passing default values
    // shopData is needed because your search.ejs file uses it
    res.render("search.ejs", {
        shopData: { shopName: "Bertie's Books" },
        keyword: '',
        availableBooks: undefined, // 'undefined' hides the results section
        exact: false
    });
});

// This route handles the search form submission
router.get(
  '/search-result',
  [
    // keep keyword reasonable length to protect DB and UI
    check('keyword').optional({ checkFalsy: true }).isLength({ max: 50 })
  ],
  function(req, res, next) {
    // On validation error, just re-render page with no results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render("search.ejs", {
            shopData: { shopName: "Bertie's Books" },
            keyword: '',
            availableBooks: [],
            exact: false
        });
    }
    // Sanitize the keyword to prevent reflected XSS when echoing back to the page
    const rawKeyword = (typeof req.query.keyword === 'string') ? req.query.keyword : '';
    const keyword = (req.sanitize(rawKeyword) || '').trim();
    const isExact = req.query.exact === '1'; // Check if the 'exact' checkbox was ticked

    // If no keyword, just re-render the search page with no results
    if (!keyword) {
        return res.render("search.ejs", {
            shopData: { shopName: "Bertie's Books" },
            keyword: '',
            availableBooks: [], // Pass empty array to show "No books found"
            exact: isExact
        });
    }

    // Build the query based on whether 'exact' was checked
    const sqlExact = "SELECT * FROM books WHERE name = ?";
    const sqlLike = "SELECT * FROM books WHERE name LIKE ?";
    const sql = isExact ? sqlExact : sqlLike;
    
    // Set the parameter for the query
    const param = isExact ? keyword : `%${keyword}%`;

    // Execute the query
    db.query(sql, [param], (err, result) => {
        if (err) return next(err); // Handle database errors
        
        // Re-render the search.ejs page, now with the search results
        res.render("search.ejs", {
            shopData: { shopName: "Bertie's Books" },
            keyword: keyword,
            availableBooks: result, // This is the array of books from the DB
            exact: isExact
        });
    });
});


router.get('/list', function(req, res, next) {
    let sqlquery = "SELECT * FROM books"; // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        }
        res.render("list.ejs", { availableBooks: result });
    });
});

router.get('/bargainbooks', function(req, res, next) {
    let sqlquery = "SELECT name, price FROM books WHERE price < 20";

    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        }
        res.render("list.ejs", { availableBooks: result });
    });
});

// Route to display the 'add book' form
router.get('/addbook', redirectLogin, function(req, res, next) {
    // We add shopData here so addbook.ejs can use it
    let shopData = { shopName: "Bertie's Books" };
    res.render('addbook.ejs', { shopData: shopData });
});

// Route to handle the 'add book' form submission 
router.post(
  '/bookadded',
  redirectLogin,
  [
    check('name')
      .trim()
      .notEmpty()
      .isLength({ max: 50 })
      .matches(/^[A-Za-z0-9 ]+$/).withMessage('Name can contain letters, numbers and spaces only'),
    check('price').isFloat({ min: 0, max: 999.99 })
  ],
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let shopData = { shopName: "Bertie's Books" };
        return res.render('addbook.ejs', { shopData: shopData });
    }

    // Sanitize the book name to prevent reflected/stored XSS; price stays numeric
    const cleanName = req.sanitize(req.body.name).trim();
    const price = req.body.price;

    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
    let newrecord = [cleanName, price];

    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            next(err);
        } else {
            res.send(' This book is added to database, name: ' + cleanName + ' price ' + price);
        }
    });
});

// Export the router object so index.js can access it
module.exports = router;