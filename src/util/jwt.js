const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'supersecret';

exports.sign = (payload) => {
  // return a promise so we can await it instead of callbacks
  return new Promise((resolve, reject) => {
    jwt.sign(payload, jwtSecret, (err, token) => {
      if (err) {
        return reject(err);
      }

      resolve(token);
    });
  });
};

exports.verify = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        return reject(err);
      }

      resolve(decoded);
    });
  });
};
