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
    res.render('login.ejs') 
})

// Route to handle login submission (/users/loggedin) - UPDATED FOR AUDIT LOGGING
router.post('/loggedin', function (req, res, next) {
    
    const username = req.body.username;
    const plainPassword = req.body.password;

    // NEW: Function to log the attempt status into audit_log
    const logAttempt = (status) => {
        let logQuery = "INSERT INTO audit_log (username, status) VALUES (?, ?)";
        db.query(logQuery, [username, status], (log_err, log_result) => {
            if (log_err) {
                // Log the database error but do NOT stop the login attempt from proceeding
                console.error("Audit Log Insertion Error:", log_err);
            }
        });
    };

    // 1. Select the stored hashed password for the given username
    let sqlquery = "SELECT hashed_password FROM users WHERE username = ?";
    
    db.query(sqlquery, [username], (db_err, result) => {
        if (db_err) {
            return next(db_err);
        }
        
        // If no user found with that username (Login Failure)
        if (result.length === 0) {
            logAttempt('FAILURE'); // Log Failure
            return res.send('Login Failed: Incorrect username or password.');
        }

        const hashedPassword = result[0].hashed_password;

        // 2. Compare the plain password with the stored hash using bcrypt
        bcrypt.compare(plainPassword, hashedPassword, function(err, compare_result) {
            if (err) {
                return next(err);
            }
            else if (compare_result == true) {
                logAttempt('SUCCESS'); // Log Success
                res.send('Login Successful! Welcome back, ' + username + '.');
            }
            else {
                logAttempt('FAILURE'); // Log Failure (Password Mismatch)
                res.send('Login Failed: Incorrect username or password.');
            }
        }); // end bcrypt.compare

    }); // end db.query
});


// TASK 6: Route to display the full audit history
router.get('/audit', function(req, res, next) {
    // Select all fields, ordering by newest attempt first
    let sqlquery = "SELECT * FROM audit_log ORDER BY attempt_at DESC";

    db.query(sqlquery, (err, result) => {
        if (err) {
            return next(err);
        }
        
        // Render the new audit.ejs page
        res.render("audit.ejs", { auditHistory: result });
    });
});


// Export the router object so index.js can access it
module.exports = router