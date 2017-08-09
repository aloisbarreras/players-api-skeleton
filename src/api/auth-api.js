const { Router } = require('express');
const debug = require('debug')('players-api-skeleton:auth-api');
const User = require('../models').User;
const jwt = require('../util/jwt');

const router = Router();

/**
 * @api {post} /api/login
 * @apiDescription Login a user
 *
 * @apiParam {String}     email                 Email for the user.
 * @apiParam {String}     password              Password for the user.
 * 
 * @apiParam {Boolean}    sucess                Success indicator.
 * @apiParam {Object}     user                  User details.
 * @apiParam {String}     token                 JWT token.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       success: true,
 *       user: {
 *         ...,
 *       },
 *       token: "supersecret"
 *     }
 *
 */

router.post('/login', async (req, res, next) => {
  try {
    // do some simple sanity checks on the body params
    req.checkBody({
      email: {
        notEmpty: true,
        isEmail: true
      },
      password: {
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
      email,
      password
    } = req.body;

    // find the user
    const user = await User.findOne(email);

    // if no user, throw error
    if (!user) {
      const err = new Error('User not found.');
      err.status = 401;
      throw err;
    }

    // if there is a user, check that the passwords match
    if (user.password !== password) {
      const err = new Error('Invalid password.');
      err.status = 401;
      throw err;
    }

    debug('Logging in user: ', user);

    // generate a JWT, just use the id as the payload
    const token = await jwt.sign({ id: user.id });

    // remove the password from the response
    // this is dirty, normally this is handled in a mongoose toJSON method
    // or something similar
    delete user.password;

    // construct the response object
    const response = {
      success: true,
      user,
      token
    };

    res.status(200).send(response);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
