const _ = require('lodash');
const debug = require('debug')('players-api-skeleton:players-model');

let players = [];

let currentId = 1;

async function createPlayer(playerDetails) {
  debug('Creating player: ', playerDetails);
  const newPlayer = _.clone(playerDetails);
  newPlayer.id = `${currentId}`;

  currentId++;

  // "save" the player
  players.push(newPlayer);

  return newPlayer;
}

async function removePlayer(query) {
  if (query.id) {
    _.remove(players, p => p.created_by === query.id);
    return;
  }

  players = [];
}

async function findOnePlayer(query) {
  debug('Finding one player with query: ', query);
  const player = _.find(players, query);
  debug('Find player results: ', player);
  return _.clone(player);
}

async function findById(id) {
  const player = _.find(players, { id });
  return _.clone(player);
}

async function findPlayers(query) {
  const userPlayers = _.filter(players, query);
  return userPlayers;
}

module.exports = {
  create: createPlayer,
  find: findPlayers,
  findOne: findOnePlayer,
  findById,
  remove: removePlayer
};
