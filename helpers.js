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
 * Retrieve information, key or subset, of an object inside an external object (like a database).
 * @param {String} checkParam Information to look for in the internal objects.
 * @param {String} dbParam Key of internal object, the "database entries".
 * @param {Object} db External object, the "database".
 * @param {Boolean} single Default true, single key matching the search. If false, subset of all matching params.
 * @returns {String/Object/Boolean} If single=true, returns key; if false, returns subset. If no matches, return false.
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

module.exports = { generateRandomString, retrieveInfo };