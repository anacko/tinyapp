const { assert } = require('chai');

const { generateRandomString, retrieveInfo, findUserByEmail, subsetUrlsByUser } = require('../helpers.js');

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

const testUrlDatabase = {
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: 'userRandomID' },
  'b2xVn3': { longURL: 'http://www.lighthouselabs.ca', userID: 'user2RandomID' },
  '9sm5xi': { longURL: 'http://www.google.com', userID: 'user2RandomID' },
  '9sm5xL': { longURL: 'http://www.canada.ca', userID: 'user2RandomID'}
};

describe('retrieveInfo', function() {
  it('should return a user with valid email', function() {
    const user = retrieveInfo("user@example.com", "email", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user, expectedOutput, `Expected to find ${expectedOutput} but found ${user}.`);
  });

  it('should return the subset of all short URLs of a valid user', function() {
    const user = retrieveInfo("user2RandomID", "userID", testUrlDatabase, false);
    const expectedOutput = {
      'b2xVn3': { longURL: 'http://www.lighthouselabs.ca', userID: 'user2RandomID' },
      '9sm5xi': { longURL: 'http://www.google.com', userID: 'user2RandomID' },
      '9sm5xL': { longURL: 'http://www.canada.ca', userID: 'user2RandomID'}
    };
    assert.deepEqual(user, expectedOutput, `Expected to find ${expectedOutput} but found ${user}.`);
  });

  it('should return false for a user with invalid email', function() {
    const user = retrieveInfo("invalidEmail@example.com", "email", testUsers);
    const expectedOutput = false;
    assert.strictEqual(user, expectedOutput, `Expected to find ${expectedOutput} but found ${user}.`);
  });

  it('should return false for short URLs of an invalid user', function() {
    const user = retrieveInfo("userNotInDb", "userID", testUrlDatabase, false);
    const expectedOutput = false;
    assert.deepEqual(user, expectedOutput, `Expected to find ${expectedOutput} but found ${user}.`);
  });

});

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user, expectedOutput, `Expected to find ${expectedOutput} but found ${user}.`);
  });

  it('should return false for a user with invalid email', function() {
    const user = findUserByEmail("invalidUser@example.com", testUsers);
    const expectedOutput = false;
    assert.strictEqual(user, expectedOutput, `Expected to find ${expectedOutput} but found ${user}.`);
  });
});

describe('subsetUrlsByUser', function() {

  it('should return the subset of all short URLs of a valid user', function() {
    const subset = subsetUrlsByUser("user2RandomID", testUrlDatabase, "userID");
    const expectedOutput = {
      'b2xVn3': { longURL: 'http://www.lighthouselabs.ca', userID: 'user2RandomID' },
      '9sm5xi': { longURL: 'http://www.google.com', userID: 'user2RandomID' },
      '9sm5xL': { longURL: 'http://www.canada.ca', userID: 'user2RandomID'}
    };
    assert.deepEqual(subset, expectedOutput, `Expected to find ${expectedOutput} but found ${subset}.`);
  });

  it('should return false for short URLs of an invalid user', function() {
    const subset = subsetUrlsByUser("userNotInDB", testUrlDatabase, "userID");
    const expectedOutput = false;
    assert.deepEqual(subset, expectedOutput, `Expected to find ${expectedOutput} but found ${subset}.`);
  });

});

describe('generateRandomString', function() {

  it('should return string, by default', function() {
    const str = generateRandomString();
    const expectedOutput = "string";
    assert.strictEqual(typeof str, expectedOutput, `Expected to find ${expectedOutput} but found ${str}.`);
  });

  it('should return string with length = 6, by default', function() {
    const str = generateRandomString();
    const expectedOutput = 6;
    assert.strictEqual(str.length, expectedOutput, `Expected to find ${expectedOutput} but found ${str}.`);
  });

  it('should return string with specified length', function() {
    const n = 10;
    const str = generateRandomString(n);
    const expectedOutput = n;
    assert.strictEqual(str.length, expectedOutput, `Expected to find ${expectedOutput} but found ${str}.`);
  });

  it('should return empty string if specified 0 (zero) length', function() {
    const n = 0;
    const str = generateRandomString(n);
    const expectedOutput = "";
    assert.strictEqual(str, expectedOutput, `Expected to find ${expectedOutput} but found ${str}.`);
  });

  it('should return empty string if NaN is passed as parameter', function() {
    const n = "ABC";
    const str = generateRandomString(n);
    const expectedOutput = "";
    assert.strictEqual(str, expectedOutput, `Expected to find ${expectedOutput} but found ${str}.`);
  });
  
});