const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'supersecret';

exports.sign = function sign(payload) {
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
