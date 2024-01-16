// LIBRARIES AND MODULES
// ---------------------

const Pool = require('pg').Pool // Postgres library
const cron = require('cron') // Cron scheduler

// File system
const log = require('./logger')
const fs = require('fs')

const settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'))
const pool = new Pool(
  settings.database
)

// GET, PROCESS AND SAVE DATA
// --------------------------

class PriceMicroservices {
  constructor(pool) {
    this.pool = pool;
    this.lastFetchedDate = settings.lastFetchedPriceDate;
    this.message = '';
  }
  async selectXFromY(selectItem, fromItem) {
    let resultset = await pool.query(`SELECT ${selectItem} FROM public.${fromItem}`);
    return resultset;
  }
  // Fetch latest price data from porssisahko.net and save to database
  async fetchLatestPriceData() {
    const LATEST_PRICES_ENDPOINT = 'https://api.porssisahko.net/v1/latest-prices.json';
    const response = await fetch(LATEST_PRICES_ENDPOINT);
    const json = await response.json();
    return json;
  }
  scheduleLatestPriceDataFetch() {
    const job = new cron.CronJob(settings.scheduler.priceTimepattern, async () => {
      try {
        const timestamp = new Date(); // Get the current timestamp
        const dateStr = timestamp.toLocaleDateString(); // Take datepart of the timestamp
        // If the date of last successful fetch is not the current day, fetch data
        if (this.lastFetchedDate !== dateStr) {
          // Log the start of the operation
          this.message = 'Started fetching price data';
          console.log(this.message);
          log.log(this.message);

          const json = await this.fetchLatestPriceData();
          // Loop through prices data and pick startDate and price elements
          json.prices.forEach(async (element) => {
            const values = [element.startDate, element.price];
            // Build a SQL clause to insert values into table
            const sqlClause = 'INSERT INTO public.hourly_price VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *';
            // Function for running SQL operations asynchronously
            const runQuery = async () => {
              let resultset = await this.pool.query(sqlClause, values);
              return resultset;
            };
            // Call query function and echo results to console
            runQuery().then((resultset) => {
              if (resultset.rows[0] != undefined) {
                this.message = 'Added a row to database';
              } else {
                this.message = 'Skipped an existing row';
              }
            });
          });

          this.lastFetchedDate = dateStr; // Set fetch date to current date
          // Update lastFetchedDate in settings
          settings.lastFetchedPriceDate = this.lastFetchedDate;
          
          // Write updated settings back to JSON file
          fs.writeFileSync('settings.json', JSON.stringify(settings, null, 2));

          this.message = 'Fetched at ' + this.lastFetchedDate;
          console.log(this.message);
          log.log(this.message);
        } else {
          this.message = 'Data was already fetched earlier today';
          console.log(this.message);
        }
      } catch (error) {
        this.message = 'An error occurred (' + error.toString() + '), trying again in 5 minutes until 4 PM';
        console.log(this.message);
        log.log(this.message);
      }
    },
    null,
    true,
    'Europe/Helsinki'
    );
  }
}

// Create an instance of the Microservices class
const priceMicroservices = new PriceMicroservices(pool);
priceMicroservices.scheduleLatestPriceDataFetch();

// Export the Microservices class
module.exports = {PriceMicroservices};