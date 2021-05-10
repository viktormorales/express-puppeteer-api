/**
 * Puppeteer + Express API boilerplate
 * 
 * @author  Viktor H. Morales <vmorales@mkdev.ar>
 * @version 1.0.0
 */
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const morgan = require('morgan');

if (process.env.NODE_ENV === 'dev') {
  app.use(morgan('combined'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Main index
const indexRouter = require('./routes/index');

// Route: /v1/pokemon
const pokemonsRouter = require('./routes/v1/pokemon');
app.use('/', indexRouter);
app.use('/v1/pokemon', pokemonsRouter);

module.exports = app;
