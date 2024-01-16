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
const { PriceMicroservices } = require('./microservices');
const pool = new Pool(settings.database);
const priceMicroservices = new PriceMicroservices(pool);

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

// START SERVER
// --------------------
app.listen(PORT)
console.log(`Palvelin kuuntelee porttia ${PORT}`)