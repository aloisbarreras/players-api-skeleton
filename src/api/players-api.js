const { Router } = require('express');
const verifyJwt = require('../middleware/jwt-verify');
const Player = require('../models/player');

const router = Router();

// all of these routes need auth
router.use(verifyJwt());

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
 *     HTTP/1.1 201 OK
 *     {
 *       success: true,
 *       player: {
 *         ...,
 *       }
 *     }
 *
 */

router.post('/', async (req, res, next) => {
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

    // this guy doesn't want to work in the schema for some reason,
    // just check for it the traditional way
    req.checkBody('handedness').isIn(['left', 'right']);

    // get the validation result and throw if something is missing
    const result = await req.getValidationResult();
    if (!result.isEmpty()) {
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
      const err = new Error('Unauthorized');
      err.status = 403;
      throw err;
    }

    // check for an existing player with first and last name
    const existingPlayer = await Player.findOne({ first_name, last_name });

    if (existingPlayer) {
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

router.get('/', async (req, res, next) => {
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

router.delete('/:id', async (req, res, next) => {
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
      const err = new Error(result.array());
      err.status = 409;
      throw err;
    }

    const playerId = req.params.id;

    const existingPlayer = await Player.findOne({ id: playerId });
    if (!existingPlayer) {
      const err = new Error('Player does not exist.');
      err.status = 404;
      throw err;
    }

    // check the the user is authorized to perform this action
    if (req.token.id !== existingPlayer.created_by) {
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
