const _ = require('lodash');

// simple storage mechanism
// store users by emails
let users = {};

// fake primary key
// incrementing integer every time a user is created
let currentId = 1;

async function createUser(userDetails) {
  const { email } = userDetails;
  if (users[email]) {
    const err = new Error('User with email already exists');
    err.status = 409;
    throw err;
  }

  userDetails.id = `${currentId}`;
  // "save" the user
  users[email] = userDetails;

  // increment the primary key
  currentId++;
  return _.clone(userDetails);
}

async function removeUser(userDetails) {
  // quick and dirty way to do this
  // if there is an email specified, remove that one user.
  // otherwise remove them all
  const { email } = userDetails;
  if (email) {
    delete users[email];
    return;
  }

  users = {};
}

async function findOneUser(email) {
  return _.clone(users[email]);
}

module.exports = {
  create: createUser,
  remove: removeUser,
  findOne: findOneUser
};
