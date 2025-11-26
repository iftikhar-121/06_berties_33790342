// Create a new router
const express = require("express");
const router = express.Router();

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
router.get('/search-result', function(req, res, next) {
    const keyword = (req.query.keyword || '').trim(); // Get keyword, trim whitespace
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
router.post('/bookadded', redirectLogin, function(req, res, next) {
    // saving data in database
    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
    // execute sql query
    let newrecord = [req.body.name, req.body.price];

    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            next(err);
        } else {
            res.send(' This book is added to database, name: ' + req.body.name + ' price ' + req.body.price);
        }
    });
});

// Export the router object so index.js can access it
module.exports = router;