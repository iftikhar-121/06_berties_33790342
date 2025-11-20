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

        // 4. DATABASE INSERT (Refer to /books/bookadded route for a hint [cite: 356])
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

// Export the router object so index.js can access it
module.exports = router