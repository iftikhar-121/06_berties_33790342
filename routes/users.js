// Create a new router
const express = require("express")
const router = express.Router()

// 1. IMPORT BCRYPT
const bcrypt = require('bcrypt') 
const saltRounds = 10 

router.get('/register', function (req, res, next) {
    res.render('register.ejs')
})

router.post('/registered', function (req, res, next) {
    
    // 2. CAPTURE PLAIN PASSWORD
    const plainPassword = req.body.password 

    // 3. HASH THE PASSWORD AND DEFINE THE INSERT LOGIC INSIDE THE CALLBACK
    bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) { 
        
        if (err) {
            return next(err); // Handle hashing error
        }

        // 4. DATABASE INSERTION
        let sqlquery = "INSERT INTO users (username, first_name, last_name, email, hashed_password) VALUES (?,?,?,?,?)";
        let newrecord = [req.body.username, req.body.first, req.body.last, req.body.email, hashedPassword];

        db.query(sqlquery, newrecord, (db_err, result) => {
            if (db_err) {
                return next(db_err); // Handle database insertion error
            }

            // 5. SEND DEBUGGING MESSAGE
            let result_message = 'Hello '+ req.body.first + ' '+ req.body.last +' you are now registered! '
            result_message += 'We will send an email to you at ' + req.body.email
            result_message += 'Your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword 
            res.send(result_message) 
        }); // end db.query

    }) // end bcrypt.hash
}); 

router.get('/list', function(req, res, next) {
    let sqlquery = "SELECT username, first_name, last_name, email FROM users";

    // Execute SQL query
    db.query(sqlquery, (err, result) => {
        if (err) {
            return next(err); // Handle database errors
        }
        
        // Render the listusers.ejs page, passing the results
        res.render("listusers.ejs", { availableUsers: result });
    });
});

// Route to display the login form (/users/login)
router.get('/login', function (req, res, next) {
    // Assumes you created views/login.ejs
    res.render('login.ejs') 
})

// Route to handle login submission (/users/loggedin)
router.post('/loggedin', function (req, res, next) {
    
    const username = req.body.username;
    const plainPassword = req.body.password;

    // 1. Select the stored hashed password for the given username
    let sqlquery = "SELECT hashed_password FROM users WHERE username = ?";
    
    db.query(sqlquery, [username], (db_err, result) => {
        if (db_err) {
            return next(db_err);
        }
        
        // If no user found with that username
        if (result.length === 0) {
            return res.send('Login Failed: Incorrect username or password.');
        }

        const hashedPassword = result[0].hashed_password;

        // 2. Compare the plain password with the stored hash using bcrypt
        bcrypt.compare(plainPassword, hashedPassword, function(err, compare_result) {
            if (err) {
                // Handle comparison error
                return next(err);
            }
            else if (compare_result == true) {
                // Send success message
                res.send('Login Successful! Welcome back, ' + username + '.');
            }
            else {
                // Send failure message (password did not match)
                res.send('Login Failed: Incorrect username or password.');
            }
        }); // end bcrypt.compare

    }); // end db.query
});




// Export the router object so index.js can access it
module.exports = router