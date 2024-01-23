// WEB-PALVELIN SÄHKÖN HINNAN SEURANTAAN JA ENNUSTAMISEEN
// ======================================================

// KIRJASTOJEN LATAUKSET
// ---------------------

const express = require('express') // Express web server framework
const { engine } = require('express-handlebars')

const { Pool } = require('pg') // Postgres kirjasto
const fs = require('fs')

// APP SETTINGS // Read from 'settings.json' file
// ---------------------
const settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'))

// MICROSERVICES
// ---------------------
const { PriceMicroservices, WeatherMicroservices } = require('./microservices');
const pool = new Pool(settings.database);
const priceMicroservices = new PriceMicroservices(pool);
const weatherMicroservices = new WeatherMicroservices(pool);

var Handlebars = require('handlebars');
Handlebars.registerHelper('formatDate', function(dateString) {
  var date = new Date(dateString);
  var hours = date.getHours();
  hours = hours < 10 ? '0'+hours : hours; // Add leading zero to hours
  var minutes = date.getMinutes();
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes;
  return strTime;
});
Handlebars.registerHelper('format1Decimal', function(number) { // Formats num to 1 decimal
  var num = parseFloat(number).toFixed(1);
  return num;
});
Handlebars.registerHelper('json', function(context) {
  return JSON.stringify(context);
});

// EXPRESS-SOVELLUKSEN ASETUKSET
// -----------------------------

const app = express() // Create Express application
const PORT = process.env.PORT || 8080

app.use(express.static('public')) // Statics
app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', './views') // Web pages

// REITTIEN MÄÄRITYKSET
// --------------------
// A default url that doesn't include lang part, will be redirected to the finnish version
app.get('/', function(req, res){
  res.redirect('/fi');
});
app.get('/:lang/', (req, res) => {
  const lang = req.params.lang;
  Promise.all([priceMicroservices.selectXFromY('price', 'current_prices'),
  priceMicroservices.selectXFromY('*', 'hourly_page'),
  priceMicroservices.selectXFromY('*', 'lowest_price_today'),
  priceMicroservices.selectXFromY('*', 'highest_price_today'),])

    .then(([priceResult, tableResult, priceLowest, priceHighest]) => {
      let priceNow = priceResult.rows[0]['price'];
      let tableData = tableResult.rows;
      let priceLowestToday = priceLowest.rows[0]['price'];
      let priceHighestToday = priceHighest.rows[0]['price'];

      let data = {
        'priceNow': priceNow,
        'tableData': tableData,
        'priceLowestToday': priceLowestToday,
        'priceHighestToday': priceHighestToday,
        'layout': `../${lang}/layouts/main`
      };
    res.render(`${lang}/index`, data);
  });
});
app.get('/:lang/general', async (req, res) => {
  try {
    const lang = req.params.lang;
    const priceResult = await priceMicroservices.selectXFromY('price', 'current_prices')
    const tableResult = await priceMicroservices.selectXFromY('*', 'hourly_page')
    const averagePriceTodayResult = await priceMicroservices.selectXFromY('average', 'average_price_today')
    const eveningPriceResult = await priceMicroservices.selectXFromY('price', 'evening_price_today')
    const lowestPriceTodayResult = await priceMicroservices.selectXFromY('*', 'lowest_price_today')
    const highestPriceTodayResult = await priceMicroservices.selectXFromY('*', 'highest_price_today')
    const weatherResult = await weatherMicroservices.selectXFromY('*', 'now_weather_helsinki')
    
    let priceNow = priceResult.rows[0]['price'];
    let priceEvening = eveningPriceResult.rows[0]['price'];
    let lowestPriceToday = lowestPriceTodayResult.rows[0]['price'];
    let lowestPriceTodayTimeslot = lowestPriceTodayResult.rows[0]['timeslot'];
    let highestPriceToday = highestPriceTodayResult.rows[0]['price'];
    let highestPriceTodayTimeslot = highestPriceTodayResult.rows[0]['timeslot'];
    let tableData = tableResult.rows;
    let averagePriceToday = averagePriceTodayResult.rows[0]['average'];
    let weatherNow = weatherResult.rows;
    
    let data = {
      'priceNow': priceNow,
      'priceEvening': priceEvening,
      'lowestPriceToday': lowestPriceToday,
      'lowestPriceTodayTimeslot': lowestPriceTodayTimeslot,
      'highestPriceToday': highestPriceToday,
      'highestPriceTodayTimeslot': highestPriceTodayTimeslot,
      'tableData': tableData,
      'averagePriceToday': averagePriceToday,
      'weather': weatherNow,
      'layout': `../${lang}/layouts/main`
    };
    res.render(`${lang}/general`, data);
  } catch (err) {
    console.error(err.message);
  }
});
// START SERVER
// --------------------
app.listen(PORT)
console.log(`Palvelin kuuntelee porttia ${PORT}`)