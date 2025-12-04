// Create a new router for API endpoints
const express = require('express');
const router = express.Router();

// GET /api/books - return all books as JSON
router.get('/books', function (req, res, next) {
    // Optional search term: /api/books?search=world
    const rawSearch = typeof req.query.search === 'string' ? req.query.search : '';
    const sanitized = (typeof req.sanitize === 'function') ? req.sanitize(rawSearch) : rawSearch;
    const search = (sanitized || '').toString().trim();

    //price range: minprice & max_price
    const minRaw = req.query.minprice;
    const maxRaw = req.query.max_price;
    const minprice = (minRaw !== undefined && minRaw !== null && !isNaN(minRaw)) ? parseFloat(minRaw) : undefined;
    const maxprice = (maxRaw !== undefined && maxRaw !== null && !isNaN(maxRaw)) ? parseFloat(maxRaw) : undefined;

    //sort: name or price
    const sortParam = typeof req.query.sort === 'string' ? req.query.sort.toLowerCase() : '';
    const sortColumn = sortParam === 'name' ? 'name' : (sortParam === 'price' ? 'price' : null);

    //Build SQL
    let sqlquery = 'SELECT * FROM books';
    const whereClauses = [];
    const params = [];

    if (search) {
        whereClauses.push('name LIKE ?');
        params.push(`%${search}%`);
    }
    if (typeof minprice === 'number') {
        whereClauses.push('price >= ?');
        params.push(minprice);
    }
    if (typeof maxprice === 'number') {
        whereClauses.push('price <= ?');
        params.push(maxprice);
    }

    if (whereClauses.length > 0) {
        sqlquery += ' WHERE ' + whereClauses.join(' AND ');
    }
    if (sortColumn) {
        sqlquery += ` ORDER BY ${sortColumn} ASC`;
    }

    // Execute the sql query
    db.query(sqlquery, params, (err, result) => {
        // Return results as a JSON object
        if (err) {
            res.json(err);
            return next(err);
        }
        return res.json(result);
    });
});

//Export API router
module.exports = router;
