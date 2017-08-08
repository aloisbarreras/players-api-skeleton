// simple storage mechanism
// store users by emails
let users = {};

module.exports = {
  Player: {},
  User: {
    create: createUser,
    remove: removeUser
  }
};

async function createUser(userDetails) {
  const { email } = userDetails;
  if (users[email]) {
    const err = new Error('User with email already exists');
    err.status = 409;
    throw err;
  }

  users[email] = userDetails;
  return userDetails;
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
