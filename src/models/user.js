const _ = require('lodash');

class UserStore {
  constructor() {
    this.users = {};
    this.currentId = 1;
  }

  async create(userDetails) {
    const { email } = userDetails;
    if (this.users[email]) {
      const err = new Error('User with email already exists');
      err.status = 409;
      throw err;
    }

    userDetails.id = `${this.currentId}`;
    // "save" the user
    this.users[email] = userDetails;

    // increment the primary key
    this.currentId++;
    return _.clone(userDetails);
  }

  async remove(userDetails) {
    // quick and dirty way to do this
    // if there is an email specified, remove that one user.
    // otherwise remove them all
    const { email } = userDetails;
    if (email) {
      delete this.users[email];
      return;
    }

    this.users = {};
  }

  async findOne(email) {
    return _.clone(this.users[email]);
  }
}

module.exports = new UserStore();
