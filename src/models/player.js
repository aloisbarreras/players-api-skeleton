const _ = require('lodash');

// simple storage mechanism
// store players by emails of user
let players = [];

let currentId = 1;

async function createPlayer(playerDetails, userEmail) {
  const player = _.clone(playerDetails);
  const { first_name, last_name } = player;

  // check for an existing player with first and last name
  const existingPlayer =
    _.find(players, p => {
      return p.first_name === first_name && p.last_name === last_name;
    });

  if (existingPlayer) {
    const err = new Error('That player already exists.');
    err.status = 409;
    throw err;
  }

  player.email = userEmail;
  player.id = `${currentId}`;

  currentId++;

  // "save" the player
  players.push(player);

  return player;
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
    if (player.email !== userEmail) {
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

async function findPlayers(userEmail) {
  // get players for this user
  const userPlayers = players.filter(player => player.email === userEmail);
  return userPlayers;
}

module.exports = {
  create: createPlayer,
  find: findPlayers,
  remove: removePlayer
};
