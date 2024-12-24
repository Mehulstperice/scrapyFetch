const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const { exec } = require('child_process');

const app = express();
const port = 3000;


const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "scraping_db",
  password: "12345",
  port: 5432, 
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Routes
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM scraping_results ORDER BY end_time DESC LIMIT 1');
    res.render('pages/index', { results: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.render('pages/index', { results: null });
  }
});

app.post('/scrape', (req, res) => {
  exec('python3 scrape.py', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).send('Script failed to execute');
    }
    res.redirect('/');
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
