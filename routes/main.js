// Create a new router
const express = require("express")
const router = express.Router()

const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('/users/login') 
    } else { 
        next (); 
    } 
}

// Import request for simple HTTP calls to external APIs (OpenWeather)
const request = require('request');

// Handle our routes
router.get('/',function(req, res, next){
    res.render('index.ejs')
});

router.get('/about',function(req, res, next){
    res.render('about.ejs')
});

// Logout route
router.get('/logout', redirectLogin, (req,res) => {
    req.session.destroy(err => {
    if (err) {
      return res.redirect('./')
    }
    res.send('you are now logged out. <a href="./">Home</a>');
    })
})

// Weather
// GET /weather
router.get('/weather', function(req, res, next) {
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
        return res.status(500).send('Weather API key not configured');
    }
    const city = (typeof req.query.city === 'string' && req.query.city.trim()) ? req.query.city.trim() : 'london';
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    request(url, function (err, response, body) {
        if (err) {
            return next(err);
        }

        let weather;
        try {
            weather = JSON.parse(body);
        } catch (e) {
            // Malformed JSON or unexpected response
            return res.render('weather.ejs', { city, temp: undefined, humidity: undefined, wind: undefined, description: undefined, error: 'No data found' });
        }

        if (weather !== undefined && weather.main !== undefined) {
            const temp = weather.main.temp;
            const humidity = weather.main.humidity;
            const wind = weather.wind && weather.wind.speed;
            const description = Array.isArray(weather.weather) && weather.weather[0] && weather.weather[0].description ? weather.weather[0].description : undefined;

            return res.render('weather.ejs', { city: weather.name || city, temp, humidity, wind, description, error: undefined });
        } else {
            return res.render('weather.ejs', { city, temp: undefined, humidity: undefined, wind: undefined, description: undefined, error: 'No data found' });
        }
    });
});


// Export the router object so index.js can access it
module.exports = router