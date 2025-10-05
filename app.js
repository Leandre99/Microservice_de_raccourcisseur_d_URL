const express = require('express');
const bodyParser = require('body-parser');
const dns = require('dns');
const url = require('url');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));

let urlDatabase = [];
let idCounter = 1;

app.get('/', (req, res) => {
  res.send('URL Shortener Microservice');
});

app.post('/api/shorturl', (req, res) => {
  const original_url = req.body.url;

  try {
    const parsedUrl = new URL(original_url);

    // Vérifie que l’hôte existe
    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) return res.json({ error: 'invalid url' });

      const short_url = idCounter++;
      urlDatabase.push({ original_url, short_url });
      res.json({ original_url, short_url });
    });
  } catch {
    res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const entry = urlDatabase.find(e => e.short_url === id);

  if (!entry) return res.json({ error: 'No short URL found for given input' });

  res.redirect(entry.original_url);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
