const { Router } = require('express');
const User = require('../models').User;
const jwt = require('../util/jwt');

const router = Router();

/**
 * @api {post} /api/user
 * @apiDescription Create a new user.
 *
 * @apiParam {String}     first_name            First name of the user.
 * @apiParam {String}     last_name             Last name of the user.
 * @apiParam {String}     email                 Email for the user.
 * @apiParam {String}     password              Password for the user.
 * @apiParam {String}     confirm_password      Confirm password for the user.
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

router.post('/', async (req, res, next) => {
  try {
    // do some simple sanity checks on the body params
    req.checkBody({
      first_name: {
        notEmpty: true
      },
      last_name: {
        notEmpty: true
      },
      email: {
        notEmpty: true,
        isEmail: true
      },
      password: {
        notEmpty: true,
        equals: {
          options: req.body.confirm_password,
          errorMessage: 'Passwords must match.'
        }
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
      email,
      password
    } = req.body;

    // create the new user
    const newUser = await User.create({
      first_name,
      last_name,
      email,
      password
    });

    // generate a JWT, just use the email as the payload
    const token = await jwt.sign({ email });

    // remove the password from the response
    // this is dirty, normall this is handled in a mongoose toJSON method
    // or something similar
    delete newUser.password;

    // construct the response objec
    const response = {
      success: true,
      user: newUser,
      token
    };

    res.status(201).send(response);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
