// For some reason, this file has to be in es6 cjs for uglify to work.

var crypto = require("crypto");
var keypair = require("keypair");
var browserifySign = require("browserify-sign");
var bs = process.browser ? browserifySign : crypto;

/**
 * Generate a new 1024-bit RSA key.
 * @returns Object {public:<pem> private:<pem>}
 */
exports.generate = function() {
  return keypair({ bits: 2048 });
};

/**
 * Return the hash of a string.
 *
 * @param String str the string to hash.
 * @returns String the sha-256 hash of `str`, hex-encoded.
 */
exports.hash = function(str) {
  const hash = crypto.createHash("sha256");
  hash.update(str);
  return hash.digest("hex");
};

/**
 * Hash a list of strings.
 * Prepend the length to each of the strings,
 * then concatenate, then hash.
 *
 * @param Array arr a list of Strings
 */
exports.hashList = function(arr) {
  const withLengths = [];
  for (var i = 0; i < arr.length; i++) {
    withLengths.push(arr[i].length);
    withLengths.push(arr[i]);
  }
  return exports.hash(withLengths.join(""));
};

/**
 * Sign a string with a RSA key.
 *
 * @param String str the data to sign
 * @param Object key The private key to use.
 * @returns String hex-encoded signature of the string.
 */
exports.sign = function(str, key) {
  const sign = bs.createSign("RSA-SHA256");
  sign.update(str);
  return sign.sign(key).toString("hex");
};

/**
 * Verify a signature with a RSA key.
 *
 * @param String str The data to verify
 * @param String sig The signature of the data
 * @param Object key the public key to use.
 */
exports.verify = function(str, sig, key) {
  const verify = bs.createVerify("RSA-SHA256");
  verify.update(str);
  return verify.verify(key, sig, "hex");
};
