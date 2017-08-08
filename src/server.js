const express = require('express');
const bodyParser = require('body-parser');
const apiRoutes = require('./api');

const app = express();

app.use(bodyParser.json());

// api routes
app.use(apiRoutes);

// 404 handler
app.use((req, res, next) => {
  const err = new Error('Route not found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send(err);
});

module.exports = app;
