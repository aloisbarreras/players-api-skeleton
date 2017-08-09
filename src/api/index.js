const { Router } = require('express');
const auth = require('./auth-api');
const user = require('./user-api');
const players = require('./players-api');

const router = Router();

router.use(auth);
router.use('/user', user);
router.use('/players', players);

module.exports = router;
