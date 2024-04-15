// WEB-PALVELIN SÄHKÖN HINNAN SEURANTAAN JA ENNUSTAMISEEN
// ======================================================

// KIRJASTOJEN LATAUKSET
// ---------------------

const express = require('express') // Express web server framework
const { engine } = require('express-handlebars')

const { Pool } = require('pg') // Postgres kirjasto
const fs = require('fs')

const settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'))

// MICROSERVICES
// ---------------------
const { PriceMicroservices, WeatherMicroservices } = require('./microservices');
const pool = new Pool(settings.database);
const priceMicroservices = new PriceMicroservices(pool);
const weatherMicroservices = new WeatherMicroservices(pool);

var Handlebars = require('handlebars');
Handlebars.registerHelper('formatDate', function(dateString) { // Formats datestr to hh:mm
  var date = new Date(dateString);
  var hours = date.getHours();
  hours = hours < 10 ? '0'+hours : hours;
  var minutes = date.getMinutes();
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes;
  return strTime;
});
Handlebars.registerHelper('formatHour', function(dateString) { // Formats hour to hh:mm
  var hour = dateString + ':00';
  var hours = hour < 10 ? '0'+ hour : hour;
  return hours;
});
Handlebars.registerHelper('formatDayName', function(timestamp) { // Formats timestamp to day name (short)
  var date = new Date(timestamp);
  var day = date.toLocaleDateString(date.getDay(), { weekday: 'short' });
  return day;
});

Handlebars.registerHelper('formatDateShort', function(timestamp) {
  var date = new Date(timestamp);
  var day = date.toLocaleDateString('fi-FI', { year: 'numeric', month: '2-digit', day: '2-digit' });
  return day;
});
Handlebars.registerHelper('format1Decimal', function(number) { // Formats num to 1 decimal
  var num = parseFloat(number).toFixed(1);
  return num;
});
Handlebars.registerHelper('json', function(context) {
  return JSON.stringify(context);
});
Handlebars.registerHelper('formatWindDegrees', function(degrees) { // Formats wind degrees to direction
  var deg = degrees;
  if (deg == 0) {
    return 'N';
  } else if (deg > 0 && deg < 90) {
    return 'NE';
  } else if (deg == 90) {
    return 'E';
  } else if (deg > 90 && deg < 180) {
    return 'SE';
  } else if (deg == 180) {
    return 'S';
  } else if (deg > 180 && deg < 270) {
    return 'SW';
  } else if (deg == 270) {
    return 'W';
  } else if (deg > 270 && deg < 360) {
    return 'NW';
  } else if (deg == 360) {
    return 'N';
  }
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
app.get('/:lang/', async (req, res) => {
  try {
    const lang = req.params.lang;
    const priceResult = await priceMicroservices.selectXFromY('price', 'current_prices')
    const tableResult = await priceMicroservices.selectXFromY('*', 'hourly_page')
    const priceLowest = await priceMicroservices.selectXFromY('*', 'lowest_price_today')
    const priceHighest = await priceMicroservices.selectXFromY('*', 'highest_price_today')

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
  } catch (err) {
    console.error(err.message);
  }
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
app.get('/:lang/spot-prices', async (req, res) => {
  try {
    const lang = req.params.lang;
    const date = new Date().toLocaleDateString('fi-FI', { timeZone: 'Europe/Helsinki' });
    const priceResult = await priceMicroservices.selectXFromY('*', 'hourly_page') // Price now AND hourly table data (from now forward)
    const averagePriceTodayResult = await priceMicroservices.selectXFromY('average', 'average_price_today') // Average price today
    const highestPriceTodayResult = await priceMicroservices.selectXFromY('*', 'highest_price_today') // Highest price today
    const lowestPriceTodayResult = await priceMicroservices.selectXFromY('*', 'lowest_price_today') // Lowest price today
    const pricesTodayResult = await priceMicroservices.selectXFromY('*', 'prices_today') // Hourly prices for today table (full)
    const comparePricesTodayResult = await priceMicroservices.selectXFromY('*', 'compare_prices_today') // Compare prices for today (full) from last year
    const pricesThisWeekHourlyResult = await priceMicroservices.selectXFromY('*', 'prices_this_week_hourly') // Prices today, in hourly form (full)
    const pricesThisWeekDailyResult = await priceMicroservices.selectXFromY('*', 'prices_this_week_daily') // Prices this week, in daily form (full)
    const pricesThisWeekAverageResult = await priceMicroservices.selectXFromY('average_price', 'prices_this_week_average') // Average this week
    const pricesThisMonthDailyResult = await priceMicroservices.selectXFromY('*', 'prices_this_month_daily') // Prices this month, in daily form (full)
    const pricesThisMonthAverageResult = await priceMicroservices.selectXFromY('average_price', 'prices_this_month_average') // Average this month
    const pricesThisYearMonthlyResult = await priceMicroservices.selectXFromY('*', 'prices_this_year_monthly') // Prices this year, in monthly form (full)
    const pricesThisYearAverageResult = await priceMicroservices.selectXFromY('average_price', 'prices_this_year_average') // Average this year
    const priceNowComparison = await priceMicroservices.selectXFromY('*', 'price_now_comparison_yesterday') // Price now comparison
    
    let priceNow = priceResult.rows[0]['price'];
    let tableData = priceResult.rows;
    let averagePriceToday = averagePriceTodayResult.rows[0]['average'];
    let highestPriceToday = highestPriceTodayResult.rows[0]['price'];
    let highestPriceTodayTimeslot = highestPriceTodayResult.rows[0]['timeslot'];
    let lowestPriceToday = lowestPriceTodayResult.rows[0]['price'];
    let lowestPriceTodayTimeslot = lowestPriceTodayResult.rows[0]['timeslot'];
    let EVChargingPriceLow = Math.round(priceNow * 35 / 100);
    let EVChargingPriceHigh = Math.round(priceNow * 100 / 100);
    let CoffeeCupPrice = parseFloat(priceNow * 0.5 / 100).toFixed(2);
    let DishwasherPrice = parseFloat(priceNow * 1.3 / 100).toFixed(2);
    let pricesTodayTable = pricesTodayResult.rows;
    let comparePricesTodayTable = comparePricesTodayResult.rows
    let pricesThisWeekHourly = pricesThisWeekHourlyResult.rows;
    let pricesThisWeekDaily = pricesThisWeekDailyResult.rows;
    let pricesThisWeekAverage = pricesThisWeekAverageResult.rows[0]['average_price'];
    let pricesThisMonthDaily = pricesThisMonthDailyResult.rows;
    let pricesThisMonthAverage = pricesThisMonthAverageResult.rows[0]['average_price'];
    let pricesThisYearMonthly = pricesThisYearMonthlyResult.rows;
    let pricesThisYearAverage = pricesThisYearAverageResult.rows[0]['average_price'];
    let consideredPrice = priceResult.rows[0]['price'];
    if (consideredPrice < 4 && consideredPrice > 1) {
      consideredPrice = 'quite low'
    } else if (consideredPrice < 1) {
      consideredPrice = 'very low'
    } else if (consideredPrice > 4 && consideredPrice < 6) {
      consideredPrice = 'medium'
    } else if (consideredPrice > 6 && consideredPrice < 10) {
      consideredPrice = 'quite high'
    } else if (consideredPrice > 10) {
      consideredPrice = 'high'
    }
    let priceNowComparisonResult = priceNowComparison.rows[0]['price'];
    let priceYesterdayComparisonResult = priceNowComparison.rows[1]['price'];
    let priceHigherOrLower = '';
    if (priceNowComparisonResult > priceYesterdayComparisonResult) {
      priceHigherOrLower = 'higher';
    } else if (priceNowComparisonResult < priceYesterdayComparisonResult) {
      priceHigherOrLower = 'lower';
    } else {
      priceHigherOrLower = 'the same';
    }


    let data = {
      'dateToday': date,
      'priceNow': priceNow,
      'averagePriceToday': averagePriceToday,
      'highestPriceToday': highestPriceToday,
      'highestPriceTodayTimeslot': highestPriceTodayTimeslot,
      'lowestPriceToday': lowestPriceToday,
      'lowestPriceTodayTimeslot': lowestPriceTodayTimeslot,
      'EVChargingPriceLow': EVChargingPriceLow,
      'EVChargingPriceHigh': EVChargingPriceHigh,
      'CoffeeCupPrice': CoffeeCupPrice,
      'DishwasherPrice': DishwasherPrice,
      'tableData': tableData,
      'pricesTodayTable': pricesTodayTable,
      'comparePricesTodayTable': comparePricesTodayTable,
      'pricesThisWeekHourly': pricesThisWeekHourly,
      'pricesThisWeekDaily': pricesThisWeekDaily,
      'pricesThisWeekAverage': pricesThisWeekAverage,
      'pricesThisMonthDaily': pricesThisMonthDaily,
      'pricesThisMonthAverage': pricesThisMonthAverage,
      'pricesThisYearMonthly': pricesThisYearMonthly,
      'pricesThisYearAverage': pricesThisYearAverage,
      'consideredPrice': consideredPrice,
      'priceNowComparison': priceHigherOrLower,
      'layout': `../${lang}/layouts/main`
    };
    res.render(`${lang}/spot_prices`, data);
  } catch (err) {
    console.error(err.message);
  }
});
app.get('/:lang/weather', async (req, res) => {
  const lang = req.params.lang;
  res.redirect(`/${lang}/weather/Helsinki`)
});
app.get('/:lang/weather/:city', async (req, res) => {
  try {
    const lang = req.params.lang;
    let city = req.params.city;
    if (city == "jyväskylä") {
      city = "jyvaskyla";
    } else if (city == "närpiö") {
      city = "narpio";
    }
    const todayResult = await weatherMicroservices.selectXFromY('*', `today_${city}`)
    const nowWeatherResult = await weatherMicroservices.selectXFromY('*', `now_weather_${city}`)
    const nextDaysResult = await weatherMicroservices.selectXFromY('*', `next_days_${city}`)
    let data = {
      'today': todayResult.rows,
      'nowWeather': nowWeatherResult.rows,
      'nextDays': nextDaysResult.rows,
      'layout': `../${lang}/layouts/main`
    };
    res.render(`${lang}/weather`, data);
  } catch (err) {
    console.error(err.message);
  }
})
app.get('/:lang/history', async (req, res) => {
  const lang = req.params.lang;
  res.redirect(`/${lang}/history/Helsinki`)
});
app.get('/:lang/history/:city', async (req, res) => {
  try {
    const lang = req.params.lang;
    let city = req.params.city;
    if (city == "jyväskylä") {
      city = "jyvaskyla";
    } else if (city == "närpiö") {
      city = "narpio";
    }
    const allWeatherHistory = await weatherMicroservices.selectXFromY('*', `all_weather_history_${city}`)

    let data = {
      'allWeatherHistory': allWeatherHistory.rows,
      'layout': `../${lang}/layouts/main`
    };
    res.render(`${lang}/history`, data);
  } catch (err) {
    console.error(err.message);
  }
});

app.get('/:lang/ai', async (req, res) => {
  const lang = req.params.lang;

  let data = {
    'layout': `../${lang}/layouts/main`
  };
  res.render(`${lang}/ai`, data);
}
);

// START SERVER
// --------------------
app.listen(PORT)
console.log(`Palvelin kuuntelee porttia ${PORT}`)