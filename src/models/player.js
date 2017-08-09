const _ = require('lodash');

// simple storage mechanism
// store players by emails of user
let players = [];

async function createPlayer(playerDetails, userEmail) {
  const { firstName, lastName } = playerDetails;

  // check for an existing player with first and last name
  const existingPlayer =
    _.find(players, player => player.firstName === firstName && player.lastName === lastName);

  if (existingPlayer) {
    const err = new Error('That player already exists.');
    err.status = 409;
    throw err;
  }

  playerDetails.userEmail = userEmail;

  // "save" the player
  players.push(playerDetails);

  return _.clone(playerDetails);
}

async function removePlayer(playerDetails, userEmail) {
  // quick and dirty way to do this
  // if there is a first and last name specified, remove that one player.
  // otherwise remove them all
  const { firstName, lastName } = playerDetails;
  if (firstName && lastName) {
    // find the player with same first and last name
    const player = _.find(players, player => player.firstName === firstName && player.lastName === lastName);
    // user can only delete his own player
    if (player.userEmail !== userEmail) {
      const err = new Error('Unauthorized');
      err.status = 403;
      throw err;
    }

    // remove the player from the array
    // super inefficient going through the array again, I know :)
    players = players.remove(players, player => player.firstName === firstName && player.lastName === lastName);
    return;
  }

  players = [];
}

module.exports = {
  create: createPlayer,
  remove: removePlayer
};
