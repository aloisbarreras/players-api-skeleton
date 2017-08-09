const _ = require('lodash');

class PlayerStore {
  constructor() {
    this.players = [];
    this.currentId = 1;
  }

  async create(playerDetails) {
    const newPlayer = _.clone(playerDetails);
    newPlayer.id = `${this.currentId}`;

    this.currentId++;

    // "save" the player
    this.players.push(newPlayer);

    return newPlayer;
  }

  async remove(query) {
    if (query.id) {
      _.remove(this.players, p => p.created_by === query.id);
      return;
    }

    this.players = [];
  }

  async findOne(query) {
    const player = _.find(this.players, query);
    return _.clone(player);
  }

  async findById(id) {
    const player = _.find(this.players, { id });
    return _.clone(player);
  }

  async find(query) {
    const userPlayers = _.filter(this.players, query);
    return userPlayers;
  }
}

module.exports = new PlayerStore();
