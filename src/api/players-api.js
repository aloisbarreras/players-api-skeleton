const { Router } = require('express');
const debug = require('debug')('players-api-skeleton:players-api');
const verifyJwt = require('../middleware/jwt-verify');
const Player = require('../models/player');

const router = Router();

/**
 * @api {post} /api/players
 * @apiDescription Create a player
 * 
 * @apiHeader {String}    Authorization         Authorization value in Bearer format.
 *
 * @apiParam {String}     first_name            First name for the player.
 * @apiParam {String}     last_name             Last name for the player.
 * @apiParam {String}     rating                Player rating.
 * @apiParam {String}     handedness            Player handedness (left or right).
 * 
 * @apiParam {Boolean}    success               Success indicator.
 * @apiParam {Object}     player                Player details.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       success: true,
 *       player: {
 *         ...,
 *       }
 *     }
 *
 */

router.post('/', verifyJwt(), async (req, res, next) => {
  try {
    const { id } = req.token;
    // do some simple sanity checks on the body params
    req.checkBody({
      first_name: {
        notEmpty: true
      },
      last_name: {
        notEmpty: true
      },
      rating: {
        notEmpty: true
      },
      handedness: {
        notEmpty: true
      },
      created_by: {
        notEmpty: true
      }
    });

    debug('received request: ', req.body);

    // get the validation result and throw if something is missing
    const result = await req.getValidationResult();
    if (!result.isEmpty()) {
      debug('Validation error: ', result.array());
      const err = new Error(result.array());
      err.status = 409;
      throw err;
    }

    // grab the fields we want
    const {
      first_name,
      last_name,
      rating,
      handedness,
      created_by
    } = req.body;

    // check the the user is authorized to perform this action
    if (id !== created_by) {
      debug('User unauthorized to create player');
      const err = new Error('Unauthorized');
      err.status = 403;
      throw err;
    }

    // check for an existing player with first and last name
    const existingPlayer = await Player.findOne({ first_name, last_name });

    if (existingPlayer) {
      debug('Found existing player with first_name last_name combo.');
      const err = new Error('That player already exists.');
      err.status = 409;
      throw err;
    }

    // create the new player
    const newPlayer = await Player.create({
      first_name,
      last_name,
      rating,
      handedness,
      created_by
    });

    debug('Created new player: ', newPlayer);

    // construct the response
    const response = {
      success: true,
      player: newPlayer
    };

    // send it
    res.status(201).send(response);
  } catch (err) {
    next(err);
  }
});

/**
 * @api {get} /api/players
 * @apiDescription List players.
 * 
 * @apiHeader {String}    Authorization         Authorization value in Bearer format.
 *
 * @apiParam {Boolean}    success               Success indicator.
 * @apiParam {Array}      players               List of players.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       success: true,
 *       players: [
 *         ...
 *       ]
 *     }
 *
 */

router.get('/', verifyJwt(), async (req, res, next) => {
  try {
    const { id } = req.token;

    // get the players
    const players = await Player.find({ created_by: id });

    // construct the response
    const response = {
      success: true,
      players
    };

    // send it
    res.status(200).send(response);
  } catch (err) {
    next(err);
  }
});

/**
 * @api {delete} /api/players
 * @apiDescription Delete a player
 * 
 * @apiHeader {String}    Authorization         Authorization value in Bearer format.
 * 
 * @apiParam {String}     id                    id for the player.
 *
 * @apiParam {Boolean}    success               Success indicator.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       success: true,
 *       players: [
 *         ...
 *       ]
 *     }
 *
 */

router.delete('/:id', verifyJwt(), async (req, res, next) => {
  try {
    // do some simple sanity checks on the body params
    req.checkParams({
      id: {
        notEmpty: true,
        isInt: true
      }
    });

    // get the validation result and throw if something is missing
    const result = await req.getValidationResult();
    if (!result.isEmpty()) {
      debug('Validation error: ', result.array());
      const err = new Error(result.array());
      err.status = 409;
      throw err;
    }

    const playerId = req.params.id;

    const existingPlayer = await Player.findOne({ id: playerId });
    if (!existingPlayer) {
      debug('Could not find existing player');
      const err = new Error('Player does not exist.');
      err.status = 404;
      throw err;
    }

    // check the the user is authorized to perform this action
    if (req.token.id !== existingPlayer.created_by) {
      debug('User unauthorized to delete player');
      const err = new Error('Unauthorized');
      err.status = 404;
      throw err;
    }

    await Player.remove(playerId);

    res.send({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
