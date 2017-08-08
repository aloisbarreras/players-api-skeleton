const { Router } = require('express');
const auth = require('./auth-api');
const user = require('./user-api');
const player = require('./player-api');

const router = Router();

router.use(auth);
router.use('/user', user);
router.use('/player', player);

module.exports = router;
