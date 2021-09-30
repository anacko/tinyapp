/**
 * Generates a random string.
 * @param {Number} n Length of the string. Default is 6. 
 * @returns {String} Random string (A-Z + a-z + 0-9) with n characters.
 */
const generateRandomString = function(n = 6) {
  let source = 'abcdefghijklmnopqrstuvwxyz';
  source += source.toUpperCase();
  source += '0123456789';
  let str = '';
  for (let k = 1; k <= n; k++) {
    str += source[Math.floor(Math.random() * source.length)];
  }
  return str;
};

/**
 * Retrieve information (key of object) inside a dataset (object).
 * @param {String} email Information to look for. Intended to be an email address.
 * @param {Object} dataset External object, the dataset.
 * @param {String} dataParam Default 'email', is the field name to look for the required information.
 * @returns {String/Boolean} Returns the key (such as user). If no matches, return false.
 */
 const findUserByEmail = function(email, dataset, dataParam='email') {
  for (let item in dataset) {
    if (dataset[item][dataParam] === email) {
      return item;
    }
  }
  return false;
};

/**
 * Retrieve subset of a dataset (object of objects).
 * @param {String} user Information for the subset. Intended to subset by user.
 * @param {Object} dataset External object, the dataset.
 * @param {String} dataParam Default 'userID', is the field name to look for the required information.
 * @returns {Object/Boolean} Returns the subset, object of objects. If no matches, return false.
 */
const subsetUrlsByUser = function(user, dataset, dataParam='userID') {
  const allOccurrences = {};
  for (let item in dataset) {
    if (dataset[item][dataParam] === user) {
		allOccurrences[item] = dataset[item];
  }
  }
  if (Object.keys(allOccurrences).length === 0) { 
    return false; 
  }
  return allOccurrences;
}


/**
 * Retrieve information, key or subset, of an object inside an external object (like a database).
 * @param {String} checkParam Information to look for in the internal objects.
 * @param {String} dbParam Key of internal object, the "database entries".
 * @param {Object} db External object, the "database".
 * @param {Boolean} single Default true, single key matching the search. If false, subset of all matching params.
 * @returns {String/Object/Boolean} If single=true, returns key; if false, returns subset. If no matches, return false.
 * 
 * NOTE: In the application, it was applied for 2 very different things. REPLACED BY: findUserByEmail and subsetUrlsByUser
 * Still exported for testing purposes: it works and testing script illustrates how.
 */
 const retrieveInfo = function(checkParam, dbParam, db, single=true) {
  const allOccurrences = {};
  for (let item in db) {
    if (db[item][dbParam] === checkParam) {
		if (single) { return item; }
		allOccurrences[item] = db[item];
  }
  }
  if (Object.keys(allOccurrences).length === 0) { return false; }
  return allOccurrences;
};

module.exports = { generateRandomString, retrieveInfo, findUserByEmail, subsetUrlsByUser };