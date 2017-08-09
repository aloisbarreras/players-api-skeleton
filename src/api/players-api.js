const { Router } = require('express');
const verifyJwt = require('../middleware/jwt-verify');
const Player = require('../models/player');

const router = Router();

/**
 * @api {post} /api/players
 * @apiDescription Login a user
 * 
 * @apiHeader {String}    Authorization         Authorization value in Bearer format.
 *
 * @apiParam {String}     first_name            Email for the user.
 * @apiParam {String}     last_name             Password for the user.
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
    const { userEmail } = req.token;
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
      }
    });

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
      handedness
    } = req.body;

    // create the new player
    const newPlayer = await Player.create({
      first_name,
      last_name,
      rating,
      handedness
    }, userEmail);

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

module.exports = router;
