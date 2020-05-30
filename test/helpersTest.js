const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return true if email passed as a parameter exists within database', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const notUser = getUserByEmail("userloo@example.com", testUsers);
    const expectedOutput = true;
    assert(user === expectedOutput)
    assert(notUser != expectedOutput)

  });
});