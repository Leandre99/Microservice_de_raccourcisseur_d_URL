require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const { URL } = require('url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

// Parse POST body
app.use(express.urlencoded({ extended: false }));

// Root route
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Base de données en mémoire pour stocker les URLs
let urlDatabase = [];
let idCounter = 1;

// Fonction de validation d'URL
function validateUrl(inputUrl, callback) {
  let parsedUrl;
  try {
    parsedUrl = new URL(inputUrl);
  } catch {
    return callback(false);
  }

  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) return callback(false);
    callback(true);
  });
}

// POST /api/shorturl
app.post('/api/shorturl', (req, res) => {
  const original_url = req.body.url;

  validateUrl(original_url, (isValid) => {
    if (!isValid) return res.json({ error: 'invalid url' });

    const short_url = idCounter++;
    urlDatabase.push({ original_url, short_url });
    res.json({ original_url, short_url });
  });
});

// GET /api/shorturl/:id
app.get('/api/shorturl/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const entry = urlDatabase.find(e => e.short_url === id);

  if (!entry) return res.json({ error: 'No short URL found for given input' });

  res.redirect(entry.original_url);
});

// Server start
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
