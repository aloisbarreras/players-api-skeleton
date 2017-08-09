const jwt = require('../util/jwt');

module.exports = function verifyJwt() {
  return (req, res, next) => {
    // grab the header
    const bearerHeader = req.header('Authorization');
    if (typeof bearerHeader !== 'undefined') {
      // grab the second half, it has the jwt
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];

      // decode it and add the decoded token to the request object
      jwt.verify(bearerToken)
        .then((decoded) => {
          req.token = decoded;
          next();
        })
        .catch(next);
    } else {
      res.status(403).send();
    }
  };
};
