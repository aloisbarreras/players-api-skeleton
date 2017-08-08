const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

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
