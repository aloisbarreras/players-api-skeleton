const jwt = require('../util/jwt');

module.exports = function verifyJwt() {
  return (req, res, next) => {
    const bearerHeader = req.header('Authorization');
    if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];
      // add the decoded token to the request object
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
